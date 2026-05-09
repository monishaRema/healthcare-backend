# PH-HealthCare Backend

## Project Requirements Document

| Field | Value |
| --- | --- |
| Project | PH-HealthCare Backend |
| Document Type | Backend Project Requirements Document |
| Status | Draft |
| Scope | Healthcare backend platform requirements |

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Functional Requirements](#2-functional-requirements)
- [3. Appointment Management Module](#3-appointment-management-module)
- [4. Payment Management Module](#4-payment-management-module-stripe-integration)
- [5. Prescription Management Module](#5-prescription-management-module)
- [6. Review Management Module](#6-review-management-module)
- [7. Non-Functional Requirements](#7-non-functional-requirements)
- [8. Technical Implementation Details](#8-technical-implementation-details)

## 1. Project Overview

PH-HealthCare is a comprehensive healthcare management system backend built with modern web technologies, designed to facilitate seamless interaction between healthcare providers (doctors) and patients through a robust, secure, and scalable API infrastructure.

### 1.1 Business Context

The healthcare industry requires:

- Secure patient data management
- Efficient appointment scheduling and management
- Integrated payment processing for medical services
- Digital prescription and medical record management
- Real-time communication capabilities (video consultations)
- Performance optimization through intelligent caching
- Audit trails for all critical operations

### 1.2 Technical Scope

This project delivers a production-grade RESTful API that handles:

- Multi-role authentication and authorization
- Complete appointment lifecycle management
- Financial transaction processing
- Medical data storage and retrieval
- Real-time scheduling and availability management
- Document management for medical reports
- Performance monitoring and logging

## 1.3 System Architecture Overview

### 1.3.1 Technology Stack

| Layer | Technology | Version | Purpose |
| --- | --- | --- | --- |
| Runtime | Node.js | 20.x LTS | JavaScript runtime environment |
| Framework | Express.js | Latest | Web application framework |
| Language | TypeScript | 5.x | Type-safe development |
| Database | PostgreSQL | 16.x | Primary data store |
| ORM | Prisma | 7.x | Database access layer |
| Cache | Redis | Latest | Performance optimization |
| Authentication | Better Auth | Latest | User authentication system |
| Payment | Stripe | Latest | Payment processing |
| Logging | Winston | Latest | Application logging |
| Validation | Zod | Latest | Schema validation |

### 1.3.2 System Characteristics

| Characteristic | Description |
| --- | --- |
| Architecture Pattern |  Layered Architecture (Controller → Service → Repository) |
| API Design |  RESTful with JSON payload |
| Authentication |  Token-based (JWT) with session management |
| Data Model |  Relational with soft-delete pattern |
| Caching Strategy |  Redis for frequently accessed data |
| File Storage |  Cloud storage (AWS S3) for medical documents |
| Deployment |  Cloud-native, containerizable |

## 1.4 Project Stakeholders

### 1.4.1 User Roles

| Role | Description |
| --- | --- |
| Super Admin | Full system access, manage all entities |
| Admin | Manage doctors, patients, view reports |
| Doctor | Manage appointments, write prescriptions, view patient data |
| Patient | Book appointments, view prescriptions, upload medical reports |

### 1.4.2 External Integrations

| Integration | Purpose |
| --- | --- |
| Stripe | Payment gateway for appointment fees |
| Cloud Storage (S3/GCS) | Medical document storage |
| Email Service | Notification system |
| Video Call Service (Twilio/Zoom) | Telemedicine consultations |

## 2. Functional Requirements

### 2.1 Authentication & Authorization Module

### 2.1.1 User Registration

##### FR-AUTH-001: Email-Based Registration

| Field | Value |
| --- | --- |
| Priority | CRITICAL |
| User Story | As a new user, I want to register with my email and password so that I can access the system. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-001.1 | System must accept email and password for registration | - Email format validation (RFC 5322 compliant)<br>- Password minimum 8 characters<br>- Password must contain: uppercase, lowercase, number, special char |
| FR-AUTH-001.2 | System must validate email uniqueness | - Duplicate email returns error with 409 status<br>- Case-insensitive email comparison |
| FR-AUTH-001.3 | System must hash passwords securely | - Use bcrypt with minimum 10 rounds<br>- Never store plain-text passwords<br>- Salt generated per password |
| FR-AUTH-001.4 | System must assign default role | - New registrations default to PATIENT role<br>- Role assignment is atomic with user creation |
| FR-AUTH-001.5 | System must create user profile | - Create corresponding Patient profile<br>- Profile linked via userId (one-to-one)<br>- Profile created in same transaction |
| FR-AUTH-001.6 | System must set initial account status | - New accounts set to PENDING status<br>- Status changes to ACTIVE after email verification |

###### Input Validation Rules

```ts
{
  email: string (valid email format, max 255 chars),
  password: string (min 8, max 100 chars),
  name: string (min 2, max 100 chars),
  contactNumber: string (optional, valid phone format),
  address: string (optional, max 500 chars)
}
```

###### Success Response

**Status:** HTTP 201 Created

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid-v7",
    "email": "user@example.com",
    "role": "PATIENT",
    "status": "PENDING"
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Invalid email format |  HTTP 400 Bad Request |
| Duplicate email |  HTTP 409 Conflict |
| Weak password |  HTTP 400 Bad Request |
| Missing required fields |  HTTP 400 Bad Request |

##### FR-AUTH-002: Email Verification

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a registered user, I want to verify my email address so that my account becomes active. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-002.1 | System must send verification email | - Email sent immediately after registration<br>- Contains unique verification token<br>- Token expires after 24 hours |
| FR-AUTH-002.2 | System must generate secure tokens | - Token minimum 32 characters<br>- Cryptographically random (crypto.randomBytes)<br>- Stored hashed in database |
| FR-AUTH-002.3 | System must verify token validity | - Check token existence<br>- Check expiration time<br>- Check if already used (one-time use) |
| FR-AUTH-002.4 | System must activate account on verification | - Update user status from PENDING to ACTIVE<br>- Delete used verification token<br>- Log verification event |
| FR-AUTH-002.5 | System must allow resend verification email | - Rate limit: 1 request per 5 minutes<br>- Generate new token<br>- Invalidate old token |

###### Email Template Requirements

- Subject: “Verify Your PH-HealthCare Account”
- Contains verification link with token
- Professional HTML template
- Mobile-responsive design

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

##### FR-AUTH-003: User Login

| Field | Value |
| --- | --- |
| Priority | CRITICAL |
| User Story | As a registered user, I want to log in with my credentials so that I can access my account. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-003.1 | System must authenticate with email/password | - Accept email and password<br>- Verify credentials against database<br>- Use secure comparison (timing-safe) |
| FR-AUTH-003.2 | System must validate account status | - Only ACTIVE accounts can login<br>- BLOCKED accounts return 403 Forbidden<br>- PENDING accounts return verification reminder<br>- DELETED accounts return 404 Not Found |
| FR-AUTH-003.3 | System must generate session tokens | - Create JWT with user ID, role, email<br>- Token expiry: 7 days (configurable)<br>- Store session in database (Better Auth) |
| FR-AUTH-003.4 | System must track login sessions | - Store session ID, IP address, user agent<br>- Update last login timestamp<br>- Allow multiple concurrent sessions |
| FR-AUTH-003.5 | System must implement rate limiting | - Max 5 failed attempts per 15 minutes<br>- Lock account after 10 failed attempts<br>- Admin unlock required |
| FR-AUTH-003.6 | System must return user profile data | - Include user ID, email, role, name<br>- Include profile data (admin/doctor/patient)<br>- Exclude sensitive fields (password) |

###### Input Validation

```ts
{
  email: string (required, valid format),
  password: string (required)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "PATIENT",
      "status": "ACTIVE"
    },
    "token": "jwt-token-string",
    "expiresIn": "7d"
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Invalid credentials |  HTTP 401 Unauthorized |
| Account blocked |  HTTP 403 Forbidden |
| Email not verified |  HTTP 403 Forbidden (with verification link) |
| Account deleted |  HTTP 404 Not Found |

##### FR-AUTH-004: Password Reset

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a user who forgot my password, I want to reset it using my email so that I can regain access to my account. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-004.1 | System must accept password reset request | - Accept email address only<br>- Validate email format<br>- Don’t reveal if email exists (security) |
| FR-AUTH-004.2 | System must send reset email | - Send email to registered address only<br>- Email contains secure reset token<br>- Token valid for 1 hour only |
| FR-AUTH-004.3 | System must generate secure reset tokens | - Token minimum 32 characters<br>- Cryptographically random<br>- One-time use only |
| FR-AUTH-004.4 | System must validate reset token | - Check token existence in database<br>- Verify token not expired<br>- Verify token not already used |
| FR-AUTH-004.5 | System must update password securely | - Hash new password with bcrypt<br>- Invalidate all existing sessions<br>- Delete used reset token<br>- Force re-login |
| FR-AUTH-004.6 | System must enforce password policy | - Same validation as registration<br>- Cannot reuse last 3 passwords<br>- Minimum 8 characters with complexity |
| FR-AUTH-004.7 | System must rate limit reset requests | - Max 3 requests per email per hour<br>- Prevent automated attacks<br>- Log suspicious activity |

###### Reset Email Template Requirements

- Subject: “Reset Your PH-HealthCare Password”
- Contains reset link with token
- Link expires in 1 hour (clear message)
- Warning about not sharing link
- Contact support link if not requested

###### Input Validation (Request Reset)

```ts
{
  email: string (required, valid format)
}
```

###### Input Validation (Confirm Reset)

```ts
{
  token: string (required, 32+ chars),
  newPassword: string (required, 8-100 chars, complexity rules)
}
```

###### Success Response (Request)

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent"
}
```

###### Success Response (Confirm)

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Password reset successfully. Please login with new password"
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Invalid token |  HTTP 400 Bad Request |
| Expired token |  HTTP 400 Bad Request |
| Token already used |  HTTP 400 Bad Request |
| Weak password |  HTTP 400 Bad Request |
| Password reuse |  HTTP 400 Bad Request (last 3 passwords) |

##### FR-AUTH-005: Change Password

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a logged-in user, I want to change my password so that I can maintain account security. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-005.1 | System must require authentication | - User must be logged in (valid JWT)<br>- Session must be active<br>- Account status must be ACTIVE |
| FR-AUTH-005.2 | System must verify current password | - User must provide current password<br>- Verify against stored hash<br>- Fail if incorrect (security) |
| FR-AUTH-005.3 | System must validate new password | - Same complexity rules as registration<br>- Different from current password<br>- Cannot reuse last 3 passwords |
| FR-AUTH-005.4 | System must update password securely | - Hash new password with bcrypt<br>- Update password field atomically<br>- Store old password hash for history |
| FR-AUTH-005.5 | System must handle force password change | - Check User.needPasswordChange flag<br>- If true, redirect to change password<br>- Block other API access until changed |
| FR-AUTH-005.6 | System must invalidate other sessions | - Keep current session active<br>- Logout all other devices/sessions<br>- Send email notification |
| FR-AUTH-005.7 | System must log password change | - Log timestamp, IP address<br>- Send confirmation email<br>- Audit trail for security |

###### Input Validation

```ts
{
  currentPassword: string (required),
  newPassword: string (required, 8-100 chars),
  confirmPassword: string (required, must match newPassword)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "sessionInvalidated": true,
    "notificationSent": true
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Incorrect current password |  HTTP 401 Unauthorized |
| Weak new password |  HTTP 400 Bad Request |
| Password mismatch |  HTTP 400 Bad Request |
| Password reuse |  HTTP 400 Bad Request |
| Not authenticated |  HTTP 401 Unauthorized |

##### FR-AUTH-006: Logout

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a logged-in user, I want to logout so that my session is terminated securely. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-006.1 | System must terminate current session | - Delete session from database<br>- Invalidate JWT token (blacklist)<br>- Clear session cookies |
| FR-AUTH-006.2 | System must support logout from all devices | - Provide “logout everywhere” option<br>- Delete all user sessions<br>- Invalidate all tokens |
| FR-AUTH-006.3 | System must log logout activity | - Record logout timestamp<br>- Log IP address and device<br>- Audit trail for security |
| FR-AUTH-006.4 | System must handle concurrent logouts | - Gracefully handle already logged-out sessions<br>- Return success even if no active session |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

###### Success Response (Logout All)

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Logged out from all devices",
  "data": {
    "sessionsTerminated": 3
  }
}
```

##### FR-AUTH-007: Session Management

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a logged-in user, I want to view and manage my active sessions so that I can ensure account security. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-AUTH-007.1 | System must list active sessions | - Show all active sessions for user<br>- Include device info, IP, last activity<br>- Highlight current session |
| FR-AUTH-007.2 | System must allow session termination | - User can terminate specific session<br>- Cannot terminate current session this way<br>- Confirmation required |
| FR-AUTH-007.3 | System must auto-expire inactive sessions | - Sessions expire after 7 days<br>- Cleanup job runs daily<br>- Expired sessions deleted from database |
| FR-AUTH-007.4 | System must limit concurrent sessions | - Max 5 active sessions per user<br>- Oldest session auto-terminated when limit reached<br>- User notified of termination |

###### Success Response (List Sessions)

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-id",
        "device": "Chrome on Windows",
        "ipAddress": "192.168.1.1",
        "lastActivity": "2026-01-29T10:30:00Z",
        "isCurrent": true,
        "expiresAt": "2026-02-05T10:30:00Z"
      }
    ]
  }
}
```

### 2.2 Role-Based Access Control (RBAC)

### 2.2.1 Role Definition & Hierarchy

##### FR-RBAC-001: User Role System

| Field | Value |
| --- | --- |
| Priority | CRITICAL |
| User Story | As a system architect, I want to define user roles with specific permissions so that access control is properly enforced. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-RBAC-001.1 | System must support four distinct roles | - SUPER_ADMIN: Full system access<br>- ADMIN: Manage users and view reports<br>- DOCTOR: Medical operations<br>- PATIENT: Consumer operations |
| FR-RBAC-001.2 | System must enforce role hierarchy | - SUPER_ADMIN > ADMIN > DOCTOR > PATIENT<br>- Higher roles inherit lower role permissions<br>- Role cannot be null |
| FR-RBAC-001.3 | System must validate role on every request | - Extract role from JWT token<br>- Verify role exists in enum<br>- Block request if role invalid |
| FR-RBAC-001.4 | System must link role to profile type | - ADMIN/SUPER_ADMIN → Admin profile<br>- DOCTOR → Doctor profile<br>- PATIENT → Patient profile<br>- One-to-one relationship enforced |

###### Role Permission Matrix

| Resource | SUPER_ADMIN | ADMIN | DOCTOR | PATIENT |
| --- | --- | --- | --- | --- |
| Manage Admins |  |  |  |  |
| Manage Doctors |  |  |  |  |
| Manage Patients |  |  |  |  |
| Manage Specialties |  |  |  |  |
| View All Appointments |  |  |  |  |
| Manage Own Schedule |  |  |  |  |
| View Own Appointments |  |  |  |  |
| Book Appointments |  |  |  |  |
| Write Prescriptions |  |  |  |  |
| View Prescriptions |  |  |  (own) |  (own) |
| Submit Reviews |  |  |  |  |
| Upload Medical Reports |  |  |  |  |
| View Patient Health Data |  |  |  (assigned) |  (own) |
| System Logs |  |  |  |  |

##### FR-RBAC-002: Authorization Middleware

| Field | Value |
| --- | --- |
| Priority | CRITICAL |
| User Story | As a developer, I want reusable authorization middleware so that I can protect routes consistently. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-RBAC-002.1 | System must provide authentication middleware | - Verify JWT token validity<br>- Check token expiration<br>- Extract user data from token<br>- Attach user to request object |
| FR-RBAC-002.2 | System must provide role-based middleware | - Accept allowed roles as parameter<br>- Compare user role with allowed roles<br>- Return 403 if unauthorized<br>- Support multiple roles per route |
| FR-RBAC-002.3 | System must validate account status | - Check user status is ACTIVE<br>- Block BLOCKED, PENDING, DELETED accounts<br>- Return appropriate error messages |
| FR-RBAC-002.4 | System must handle missing/invalid tokens | - Return 401 for missing token<br>- Return 401 for invalid/expired token<br>- Return 401 for tampered token |
| FR-RBAC-002.5 | System must support resource ownership checks | - Verify user owns the resource<br>- Allow access to own data<br>- Block access to others’ data<br>- Admin override capability |

###### Middleware Usage Pattern

```ts
// Route protection examples
router.get(
  "/appointments",
  authenticate,
  authorize(["SUPER_ADMIN", "ADMIN"]),
  appointmentController.getAll,
);
```

- router.get(
-   "/appointments/my",
-   authenticate,
-   authorize(["DOCTOR", "PATIENT"]),
-   appointmentController.getMy,
- );

- router.post(
-   "/prescription",
-   authenticate,
-   authorize(["DOCTOR"]),
-   prescriptionController.create,
- );

###### Error Response (Unauthorized)

**Status:** HTTP 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied. Required roles: SUPER_ADMIN, ADMIN",
  "statusCode": 403
}
```

##### FR-RBAC-003: Resource Ownership Validation

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a user, I want to ensure that I can only access my own data and not others’ private information. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-RBAC-003.1 | System must validate patient data ownership | - Patients can only view own appointments<br>- Patients can only view own prescriptions<br>- Patients can only view own medical reports<br>- Patients can only edit own profile |
| FR-RBAC-003.2 | System must validate doctor data ownership | - Doctors can view appointments assigned to them<br>- Doctors can write prescriptions for own patients<br>- Doctors can view health data of assigned patients<br>- Doctors can manage own schedule |
| FR-RBAC-003.3 | System must implement admin override | - Admins can view all user data (except passwords)<br>- Super admins have unrestricted access<br>- All admin actions logged for audit |
| FR-RBAC-003.4 | System must check ownership at service layer | - Ownership check in service methods<br>- Not just at controller level<br>- Prevents bypass through direct service calls |

###### Ownership Validation Logic

```ts
// Example: Patient viewing appointment
if (user.role === "PATIENT") {
  // Must be their own appointment
  if (appointment.patientId !== user.patientId) {
    throw new ForbiddenError("Access denied");
  }
}
```

- // Example: Doctor viewing patient health data
- if (user.role === "DOCTOR") {
-   // Must have appointment with patient
-   const hasAppointment = await checkDoctorPatientRelation(
-     user.doctorId,
-     patientId,
-   );
-   if (!hasAppointment) {
-     throw new ForbiddenError("No treatment relationship");
-   }
- }

### 2.3 User Profile Management

### 2.3.1 Admin Management

##### FR-ADMIN-001: Create Admin User

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a super admin, I want to create admin accounts so that I can delegate system management tasks. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-ADMIN-001.1 | System must allow super admin to create admins | - Only SUPER_ADMIN can create admins<br>- Create User + Admin profile atomically<br>- Transaction rollback on failure |
| FR-ADMIN-001.2 | System must validate admin data | - Name required (2-100 chars)<br>- Email required and unique<br>- Contact number optional but validated<br>- Profile photo optional (URL format) |
| FR-ADMIN-001.3 | System must set appropriate defaults | - Role set to ADMIN<br>- Status set to ACTIVE<br>- needPasswordChange set to true<br>- Email denormalized to Admin table |
| FR-ADMIN-001.4 | System must send welcome email | - Email with temporary password<br>- Force password change on first login<br>- Account activation link |

###### Input Validation

```ts
{
  name: string (required, 2-100 chars),
  email: string (required, valid format, unique),
  password: string (required, 8-100 chars),
  contactNumber: string (optional, valid phone),
  profilePhoto: string (optional, valid URL)
}
```

###### Success Response

**Status:** HTTP 201 Created

```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "admin-uuid",
    "email": "admin@example.com",
    "name": "John Smith",
    "role": "ADMIN",
    "status": "ACTIVE",
    "needPasswordChange": true
  }
}
```

##### FR-ADMIN-002: Update Admin Profile

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As an admin, I want to update my profile information so that my details remain current. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-ADMIN-002.1 | System must allow admin self-update | - Admin can update own profile<br>- Cannot change email (requires verification)<br>- Cannot change role (requires super admin) |
| FR-ADMIN-002.2 | System must allow super admin to update any admin | - Super admin can update any admin profile<br>- Can change role (ADMIN ↔︎ SUPER_ADMIN)<br>- Can change status (ACTIVE/BLOCKED) |
| FR-ADMIN-002.3 | System must validate update data | - Name validation (if provided)<br>- Contact number validation (if provided)<br>- Profile photo URL validation (if provided) |
| FR-ADMIN-002.4 | System must sync with User table | - Update email in User table if changed<br>- Maintain referential integrity<br>- Atomic transaction |
| FR-ADMIN-002.5 | System must invalidate cache | - Clear admin cache after update<br>- Clear user cache after update<br>- Ensure consistency |

###### Input Validation

```ts
{
  name: string (optional, 2-100 chars),
  contactNumber: string (optional, valid phone),
  profilePhoto: string (optional, valid URL)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Admin profile updated successfully",
  "data": {
    "id": "admin-uuid",
    "name": "John Smith Updated",
    "email": "admin@example.com",
    "contactNumber": "+1234567890",
    "profilePhoto": "https://example.com/photo.jpg"
  }
}
```

##### FR-ADMIN-003: Get Admin List

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a super admin, I want to view all admin accounts so that I can manage the team. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-ADMIN-003.1 | System must return paginated admin list | - Support page and limit parameters<br>- Default: page=1, limit=10<br>- Max limit: 100 |
| FR-ADMIN-003.2 | System must support filtering | - Filter by status (ACTIVE, BLOCKED)<br>- Filter by role (ADMIN, SUPER_ADMIN)<br>- Search by name or email |
| FR-ADMIN-003.3 | System must support sorting | - Sort by createdAt (default: DESC)<br>- Sort by name (A-Z, Z-A)<br>- Sort by email |
| FR-ADMIN-003.4 | System must exclude soft-deleted records | - Check isDeleted = false<br>- Include deletedAt timestamp in response<br>- Option to include deleted (super admin) |
| FR-ADMIN-003.5 | System must exclude sensitive data | - Never return password hash<br>- Never return internal IDs<br>- Sanitize response |

###### Query Parameters

```ts
{
  page: number (default: 1, min: 1),
  limit: number (default: 10, max: 100),
  searchTerm: string (optional, search name/email),
  status: 'ACTIVE' | 'BLOCKED' (optional),
  role: 'ADMIN' | 'SUPER_ADMIN' (optional),
  sortBy: 'createdAt' | 'name' | 'email' (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": [
    {
      "id": "admin-uuid",
      "name": "John Smith",
      "email": "admin@example.com",
      "role": "ADMIN",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 2.3.2 Doctor Management

##### FR-DOCTOR-001: Create Doctor Profile

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As an admin, I want to create doctor accounts so that healthcare providers can use the system. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-DOCTOR-001.1 | System must allow admin to create doctors | - SUPER_ADMIN and ADMIN can create doctors<br>- Create User + Doctor profile atomically<br>- Transaction rollback on failure |
| FR-DOCTOR-001.2 | System must validate doctor data | - Name required (2-100 chars)<br>- Email required and unique<br>- Contact number required (doctors must be reachable)<br>- Registration number required and unique (medical license) |
| FR-DOCTOR-001.3 | System must validate medical credentials | - Registration number format validation<br>- Qualification required (e.g., “MBBS, MD”)<br>- Experience must be non-negative integer<br>- Current working place required |
| FR-DOCTOR-001.4 | System must validate financial information | - Appointment fee required<br>- Fee stored as integer (cents/paisa)<br>- Fee must be positive (>0)<br>- Fee reasonable range (100-1000000 cents) |
| FR-DOCTOR-001.5 | System must set appropriate defaults | - Role set to DOCTOR<br>- Status set to ACTIVE<br>- needPasswordChange set to true<br>- averageRating set to 0<br>- totalReviews set to 0<br>- Email denormalized to Doctor table |
| FR-DOCTOR-001.6 | System must handle specialty assignment | - Optionally accept specialty IDs<br>- Create DoctorSpecialty records<br>- Validate specialty IDs exist<br>- Support multiple specialties |
| FR-DOCTOR-001.7 | System must send welcome email | - Email with temporary password<br>- Doctor portal login instructions<br>- Force password change on first login |

###### Input Validation

```ts
{
  name: string (required, 2-100 chars),
  email: string (required, valid format, unique),
  password: string (required, 8-100 chars),
  contactNumber: string (required, valid phone),
  address: string (optional, max 500 chars),
  registrationNumber: string (required, unique, alphanumeric),
  experience: number (required, min: 0, max: 70),
  gender: 'MALE' | 'FEMALE' | 'OTHER' (required),
  appointmentFee: number (required, min: 100, max: 1000000),
  qualification: string (required, 2-200 chars),
  currentWorkingPlace: string (required, 2-200 chars),
  designation: string (required, 2-100 chars),
  bio: string (optional, max 1000 chars),
  profilePhoto: string (optional, valid URL),
  specialtyIds: string[] (optional, array of valid UUIDs)
}
```

###### Success Response

**Status:** HTTP 201 Created

```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": {
    "id": "doctor-uuid",
    "email": "doctor@example.com",
    "name": "Dr. Jane Smith",
    "registrationNumber": "BM123456",
    "appointmentFee": 5000,
    "experience": 10,
    "qualification": "MBBS, MD (Cardiology)",
    "designation": "Senior Cardiologist",
    "role": "DOCTOR",
    "status": "ACTIVE",
    "specialties": [
      {
        "id": "specialty-uuid",
        "title": "Cardiology"
      }
    ]
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Duplicate registration number |  HTTP 409 Conflict |
| Invalid specialty ID |  HTTP 400 Bad Request |
| Negative fee or experience |  HTTP 400 Bad Request |

##### FR-DOCTOR-002: Update Doctor Profile

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a doctor, I want to update my profile so that patients see accurate information. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-DOCTOR-002.1 | System must allow doctor self-update | - Doctor can update own profile<br>- Cannot change email (requires verification)<br>- Cannot change registration number<br>- Cannot change role |
| FR-DOCTOR-002.2 | System must allow admin to update any doctor | - Admin can update any doctor profile<br>- Can change status (ACTIVE/BLOCKED)<br>- Cannot change registration number (immutable) |
| FR-DOCTOR-002.3 | System must validate update data | - All field validations same as create<br>- Partial update supported<br>- Only provided fields validated |
| FR-DOCTOR-002.4 | System must handle specialty updates | - Add new specialties<br>- Remove existing specialties<br>- Atomic specialty update operation<br>- Validate specialty IDs |
| FR-DOCTOR-002.5 | System must sync with User table | - Update email in User table if changed<br>- Maintain referential integrity<br>- Atomic transaction |
| FR-DOCTOR-002.6 | System must invalidate cache | - Clear doctor cache after update<br>- Clear doctor list cache<br>- Clear specialty-doctor cache |
| FR-DOCTOR-002.7 | System must not allow rating manipulation | - averageRating is read-only (calculated)<br>- totalReviews is read-only (calculated)<br>- Return error if attempted |

###### Input Validation (All fields optional)

```ts
{
  name: string (optional, 2-100 chars),
  contactNumber: string (optional, valid phone),
  address: string (optional, max 500 chars),
  experience: number (optional, min: 0, max: 70),
  appointmentFee: number (optional, min: 100, max: 1000000),
  qualification: string (optional, 2-200 chars),
  currentWorkingPlace: string (optional, 2-200 chars),
  designation: string (optional, 2-100 chars),
  bio: string (optional, max 1000 chars),
  profilePhoto: string (optional, valid URL),
  specialtyIds: string[] (optional, replace all specialties)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor profile updated successfully",
  "data": {
    "id": "doctor-uuid",
    "name": "Dr. Jane Smith Updated",
    "appointmentFee": 6000,
    "bio": "Experienced cardiologist with 10+ years",
    "specialties": [
      {
        "id": "specialty-1",
        "title": "Cardiology"
      },
      {
        "id": "specialty-2",
        "title": "Internal Medicine"
      }
    ]
  }
}
```

##### FR-DOCTOR-003: Get Doctor List

| Field | Value |
| --- | --- |
| Priority | CRITICAL |
| User Story | As a patient, I want to browse available doctors so that I can find the right specialist. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-DOCTOR-003.1 | System must return paginated doctor list | - Support page and limit parameters<br>- Default: page=1, limit=10<br>- Max limit: 50 (performance) |
| FR-DOCTOR-003.2 | System must support filtering | - Filter by specialty (single or multiple)<br>- Filter by gender<br>- Filter by experience range (min-max)<br>- Filter by fee range (min-max)<br>- Search by name (partial match, case-insensitive) |
| FR-DOCTOR-003.3 | System must support sorting | - Sort by averageRating (default: DESC)<br>- Sort by appointmentFee (ASC/DESC)<br>- Sort by experience (DESC)<br>- Sort by name (A-Z, Z-A) |
| FR-DOCTOR-003.4 | System must include related data | - Include specialties for each doctor<br>- Include total reviews count<br>- Include average rating<br>- Do not include sensitive data (password, userId) |
| FR-DOCTOR-003.5 | System must exclude soft-deleted records | - Check isDeleted = false<br>- Only show ACTIVE doctors to patients<br>- Admins can see BLOCKED doctors |
| FR-DOCTOR-003.6 | System must implement caching | - Cache doctor list for 5 minutes<br>- Cache key includes all filters/sort<br>- Invalidate on any doctor update |

###### Query Parameters

```ts
{
  page: number (default: 1, min: 1),
  limit: number (default: 10, max: 50),
  searchTerm: string (optional, search name/qualification),
  specialtyIds: string[] (optional, filter by specialties),
  gender: 'MALE' | 'FEMALE' | 'OTHER' (optional),
  minExperience: number (optional, min: 0),
  maxExperience: number (optional),
  minFee: number (optional, in cents),
  maxFee: number (optional, in cents),
  sortBy: 'averageRating' | 'appointmentFee' | 'experience' | 'name',
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctors retrieved successfully",
  "data": [
    {
      "id": "doctor-uuid",
      "name": "Dr. Jane Smith",
      "email": "doctor@example.com",
      "contactNumber": "+1234567890",
      "registrationNumber": "BM123456",
      "experience": 10,
      "gender": "FEMALE",
      "appointmentFee": 5000,
      "qualification": "MBBS, MD (Cardiology)",
      "currentWorkingPlace": "City Hospital",
      "designation": "Senior Cardiologist",
      "bio": "Experienced cardiologist...",
      "profilePhoto": "https://example.com/photo.jpg",
      "averageRating": 4.8,
      "totalReviews": 150,
      "specialties": [
        {
          "id": "specialty-uuid",
          "title": "Cardiology",
          "icon": "https://example.com/icon.png"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

##### FR-DOCTOR-004: Get Doctor by ID

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a patient, I want to view detailed doctor information so that I can make an informed decision. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-DOCTOR-004.1 | System must return complete doctor profile | - All public fields included<br>- Include all specialties<br>- Include recent reviews (last 5)<br>- Calculate rating statistics |
| FR-DOCTOR-004.2 | System must validate doctor existence | - Return 404 if doctor not found<br>- Return 404 if doctor soft-deleted<br>- Return 403 if doctor blocked (for patients) |
| FR-DOCTOR-004.3 | System must include availability status | - Check if doctor has available schedule slots<br>- Show next available date (if any)<br>- Show total available slots this week |
| FR-DOCTOR-004.4 | System must implement caching | - Cache individual doctor for 10 minutes<br>- Cache key: doctor ID<br>- Invalidate on doctor update |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor retrieved successfully",
  "data": {
    "id": "doctor-uuid",
    "name": "Dr. Jane Smith",
    "email": "doctor@example.com",
    "contactNumber": "+1234567890",
    "address": "123 Medical Plaza",
    "registrationNumber": "BM123456",
    "experience": 10,
    "gender": "FEMALE",
    "appointmentFee": 5000,
    "qualification": "MBBS, MD (Cardiology)",
    "currentWorkingPlace": "City Hospital",
    "designation": "Senior Cardiologist",
    "bio": "Experienced cardiologist with 10+ years of practice...",
    "profilePhoto": "https://example.com/photo.jpg",
    "averageRating": 4.8,
    "totalReviews": 150,
    "specialties": [
      {
        "id": "specialty-uuid",
        "title": "Cardiology",
        "icon": "https://example.com/icon.png",
        "description": "Heart and cardiovascular diseases"
      }
    ],
    "recentReviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "comment": "Excellent doctor!",
        "patientName": "John D.",
        "createdAt": "2026-01-25T10:00:00Z"
      }
    ],
    "availability": {
      "hasAvailableSlots": true,
      "nextAvailableDate": "2026-01-30",
      "availableSlotsThisWeek": 12
    }
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Doctor not found |  HTTP 404 Not Found |
| Doctor deleted |  HTTP 404 Not Found |
| Doctor blocked (patient access) |  HTTP 403 Forbidden |

##### FR-DOCTOR-005: Delete Doctor (Soft Delete)

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As an admin, I want to deactivate doctor accounts so that they no longer appear in active listings. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-DOCTOR-005.1 | System must allow admin to soft delete | - Only SUPER_ADMIN and ADMIN can delete<br>- Set isDeleted = true<br>- Set deletedAt = current timestamp<br>- Do not delete from database (data retention) |
| FR-DOCTOR-005.2 | System must handle related data | - Do not delete appointments (keep history)<br>- Do not delete prescriptions<br>- Do not delete reviews<br>- Mark DoctorSchedule as inactive |
| FR-DOCTOR-005.3 | System must prevent future operations | - Cannot book new appointments<br>- Cannot create new schedules<br>- Cannot login (account blocked)<br>- Past data remains accessible for audit |
| FR-DOCTOR-005.4 | System must notify affected users | - Send email to doctor (account deactivation)<br>- Notify patients with upcoming appointments<br>- Provide alternative doctor recommendations |
| FR-DOCTOR-005.5 | System must invalidate cache | - Clear doctor from cache<br>- Clear doctor from list cache<br>- Clear specialty-doctor cache |
| FR-DOCTOR-005.6 | System must log deletion | - Record who deleted (admin ID)<br>- Record deletion timestamp<br>- Record reason (if provided)<br>- Audit trail for compliance |

###### Input Validation

```ts
{
  reason: string (optional, max 500 chars)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor account deactivated successfully",
  "data": {
    "id": "doctor-uuid",
    "name": "Dr. Jane Smith",
    "deletedAt": "2026-01-29T12:00:00Z",
    "upcomingAppointments": 3,
    "affectedPatients": 3
  }
}
```

###### Business Rules

- Cannot delete doctor with appointments in next 24 hours (must reschedule first)
- Cannot delete doctor with pending prescriptions
- Super admin can override and force delete if necessary
- Deleted doctors can be restored by super admin

### 2.3.3 Patient Management

##### FR-PATIENT-001: Update Patient Profile

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a patient, I want to update my profile information so that my contact details remain current. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PATIENT-001.1 | System must allow patient self-update | - Patient can update own profile<br>- Cannot change email (requires verification)<br>- Cannot change role<br>- Update User and Patient tables atomically |
| FR-PATIENT-001.2 | System must allow admin to update patient | - Admin can update any patient profile<br>- Can change status (ACTIVE/BLOCKED)<br>- Cannot change email without verification |
| FR-PATIENT-001.3 | System must validate update data | - Name validation (if provided)<br>- Contact number validation (if provided)<br>- Address validation (if provided)<br>- Profile photo URL validation |
| FR-PATIENT-001.4 | System must sync with User table | - Maintain referential integrity<br>- Atomic transaction<br>- Rollback on failure |
| FR-PATIENT-001.5 | System must invalidate cache | - Clear patient cache after update<br>- Clear appointment cache if contact changed<br>- Ensure data consistency |

###### Input Validation (All fields optional)

```ts
{
  name: string (optional, 2-100 chars),
  contactNumber: string (optional, valid phone),
  address: string (optional, max 500 chars),
  profilePhoto: string (optional, valid URL)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Patient profile updated successfully",
  "data": {
    "id": "patient-uuid",
    "name": "John Doe Updated",
    "email": "patient@example.com",
    "contactNumber": "+1234567890",
    "address": "456 New Address",
    "profilePhoto": "https://example.com/photo.jpg"
  }
}
```

##### FR-PATIENT-002: Get Patient List (Admin View)

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As an admin, I want to view all patients so that I can manage user accounts. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PATIENT-002.1 | System must return paginated patient list | - Support page and limit parameters<br>- Default: page=1, limit=10<br>- Max limit: 100 |
| FR-PATIENT-002.2 | System must support filtering | - Filter by status (ACTIVE, BLOCKED, DELETED)<br>- Search by name or email<br>- Filter by registration date range |
| FR-PATIENT-002.3 | System must support sorting | - Sort by createdAt (default: DESC)<br>- Sort by name (A-Z, Z-A)<br>- Sort by email |
| FR-PATIENT-002.4 | System must include summary statistics | - Total appointments count<br>- Total reviews count<br>- Last appointment date |
| FR-PATIENT-002.5 | System must exclude soft-deleted by default | - Check isDeleted = false<br>- Option to include deleted (admin only)<br>- Never show passwords |
| FR-PATIENT-002.6 | System must implement authorization | - Only SUPER_ADMIN and ADMIN can access<br>- Return 403 for other roles |

###### Query Parameters

```ts
{
  page: number (default: 1, min: 1),
  limit: number (default: 10, max: 100),
  searchTerm: string (optional, search name/email),
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED' (optional),
  includeDeleted: boolean (default: false, admin only),
  sortBy: 'createdAt' | 'name' | 'email' (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Patients retrieved successfully",
  "data": [
    {
      "id": "patient-uuid",
      "name": "John Doe",
      "email": "patient@example.com",
      "contactNumber": "+1234567890",
      "address": "123 Main St",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00Z",
      "statistics": {
        "totalAppointments": 5,
        "totalReviews": 3,
        "lastAppointment": "2026-01-20T14:00:00Z"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

##### FR-PATIENT-003: Get Patient by ID

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As an admin or doctor, I want to view patient details so that I can provide appropriate care. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PATIENT-003.1 | System must return complete patient profile | - All public fields included<br>- Include health data if exists<br>- Include appointment history summary<br>- Exclude password and sensitive tokens |
| FR-PATIENT-003.2 | System must validate access permissions | - Patient can view own profile<br>- Doctor can view assigned patients only<br>- Admin can view all patients<br>- Return 403 for unauthorized access |
| FR-PATIENT-003.3 | System must include health information | - Include PatientHealthData if exists<br>- Include recent medical reports (last 5)<br>- Calculate health risk indicators |
| FR-PATIENT-003.4 | System must validate patient existence | - Return 404 if patient not found<br>- Return 404 if patient soft-deleted<br>- Appropriate error messages |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Patient retrieved successfully",
  "data": {
    "id": "patient-uuid",
    "name": "John Doe",
    "email": "patient@example.com",
    "contactNumber": "+1234567890",
    "address": "123 Main St",
    "profilePhoto": "https://example.com/photo.jpg",
    "status": "ACTIVE",
    "createdAt": "2026-01-15T10:00:00Z",
    "healthData": {
      "id": "health-data-uuid",
      "dateOfBirth": "1990-05-15",
      "gender": "MALE",
      "bloodGroup": "A_POSITIVE",
      "heightCm": 175,
      "weightKg": 70,
      "bmi": 22.86,
      "allergies": "Penicillin",
      "chronicConditions": "None"
    },
    "statistics": {
      "totalAppointments": 5,
      "completedAppointments": 4,
      "cancelledAppointments": 1,
      "totalReviews": 3,
      "averageRatingGiven": 4.7
    }
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Patient not found |  HTTP 404 Not Found |
| Unauthorized access (doctor viewing non-assigned patient) |  HTTP 403 Forbidden |

##### FR-PATIENT-004: Patient Health Data Management

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a patient, I want to manage my health information so that doctors have accurate medical history. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PATIENT-004.1 | System must create/update health data | - Patient can create health profile once<br>- Patient can update health profile anytime<br>- Upsert operation (create or update)<br>- One-to-one relationship with Patient |
| FR-PATIENT-004.2 | System must validate health data | - Date of birth: past date, reasonable (18-120 years)<br>- Height: 50-250 cm<br>- Weight: 20-300 kg<br>- BMI calculated automatically<br>- Blood group enum validation |
| FR-PATIENT-004.3 | System must calculate BMI automatically | - Formula: weight(kg) / (height(m))²<br>- Round to 2 decimal places<br>- Update on height/weight change<br>- Store calculated value |
| FR-PATIENT-004.4 | System must enforce data privacy | - Only patient can edit own data<br>- Doctors can view assigned patients only<br>- Admins have read-only access |
| FR-PATIENT-004.5 | System must validate optional fields | - Emergency contact validation<br>- Marital status enum<br>- Boolean fields nullable<br>- Text fields sanitized |
| FR-PATIENT-004.6 | System must maintain audit trail | - Log all health data changes<br>- Record who made changes<br>- Timestamp all modifications<br>- Compliance requirement |

###### Input Validation

```ts
{
  dateOfBirth: string (required, ISO date, past, age 18-120),
  gender: 'MALE' | 'FEMALE' | 'OTHER' (required),
  bloodGroup: 'A_POSITIVE' | 'A_NEGATIVE' | ... (optional),
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' (optional),
  heightCm: number (optional, 50-250),
  weightKg: number (optional, 20-300),
  allergies: string (optional, max 1000 chars),
  chronicConditions: string (optional, max 1000 chars),
  currentMedications: string (optional, max 1000 chars),
  familyMedicalHistory: string (optional, max 2000 chars),
  emergencyContactName: string (optional, 2-100 chars),
  emergencyContactPhone: string (optional, valid phone),
  smokingStatus: boolean (optional),
  alcoholConsumption: boolean (optional),
  dietaryPreferences: string (optional, max 500 chars)
}
```

###### Success Response

**Status:** HTTP 201 Created (or 200 OK for update)

```json
{
  "success": true,
  "message": "Health data saved successfully",
  "data": {
    "id": "health-data-uuid",
    "patientId": "patient-uuid",
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "bloodGroup": "A_POSITIVE",
    "maritalStatus": "MARRIED",
    "heightCm": 175,
    "weightKg": 70,
    "bmi": 22.86,
    "allergies": "Penicillin, Peanuts",
    "chronicConditions": "None",
    "currentMedications": "None",
    "familyMedicalHistory": "Diabetes (grandfather)",
    "emergencyContactName": "Jane Doe",
    "emergencyContactPhone": "+1234567890",
    "smokingStatus": false,
    "alcoholConsumption": false,
    "dietaryPreferences": "Vegetarian"
  }
}
```

###### BMI Categories (for reference)

| Category | Range |
| --- | --- |
| Underweight |  < 18.5 |
| Normal |  18.5 - 24.9 |
| Overweight |  25 - 29.9 |
| Obese |  ≥ 30 |

##### FR-PATIENT-005: Medical Report Upload

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient, I want to upload medical reports so that doctors can access my medical history. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PATIENT-005.1 | System must accept file uploads | - Support PDF, JPG, PNG formats<br>- Max file size: 10MB<br>- File type validation (MIME type)<br>- Virus scanning before storage |
| FR-PATIENT-005.2 | System must upload to cloud storage | - Upload to AWS S3 or equivalent<br>- Generate secure file URL<br>- Set file permissions (private)<br>- Return public signed URL (temporary) |
| FR-PATIENT-005.3 | System must store metadata in database | - Store file URL, not file itself<br>- Store report name, type, notes<br>- Link to patient (patientId)<br>- Timestamp upload |
| FR-PATIENT-005.4 | System must validate report data | - Report name required (2-200 chars)<br>- Report type enum validation<br>- Notes optional (max 1000 chars)<br>- File URL stored as string |
| FR-PATIENT-005.5 | System must enforce access control | - Only patient can upload own reports<br>- Doctors can view assigned patients’ reports<br>- Admins can view all reports<br>- Signed URLs expire in 1 hour |
| FR-PATIENT-005.6 | System must list patient reports | - Paginated list of reports<br>- Sort by upload date (newest first)<br>- Filter by report type<br>- Include download links |

###### Input Validation (Upload)

```ts
{
  file: File (required, PDF/JPG/PNG, max 10MB),
  reportName: string (required, 2-200 chars),
  reportType: 'LAB_TEST' | 'IMAGING' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'OTHER',
  notes: string (optional, max 1000 chars)
}
```

###### Success Response (Upload)

**Status:** HTTP 201 Created

```json
{
  "success": true,
  "message": "Medical report uploaded successfully",
  "data": {
    "id": "report-uuid",
    "patientId": "patient-uuid",
    "reportName": "Blood Test Results",
    "reportType": "LAB_TEST",
    "fileUrl": "https://s3.amazonaws.com/bucket/reports/...",
    "notes": "Annual checkup blood work",
    "createdAt": "2026-01-29T10:00:00Z"
  }
}
```

###### Success Response (List Reports)

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Medical reports retrieved successfully",
  "data": [
    {
      "id": "report-uuid",
      "reportName": "Blood Test Results",
      "reportType": "LAB_TEST",
      "fileUrl": "https://signed-url-expires-in-1hr",
      "notes": "Annual checkup",
      "createdAt": "2026-01-29T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

###### File Storage Structure

```text
/medical-reports
  /{patientId}
    /{reportId}-{timestamp}.{extension}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| File too large |  HTTP 413 Payload Too Large |
| Invalid file type |  HTTP 400 Bad Request |
| Virus detected |  HTTP 422 Unprocessable Entity |
| Upload failed |  HTTP 500 Internal Server Error |

###### Business Rules

- Patients must complete health data before first appointment booking
- Health data required fields: DOB, gender
- BMI calculation triggers health risk alerts if outside normal range
- Medical reports retained for 7 years (compliance)
- Maximum 50 reports per patient
- Report files deleted from storage 90 days after patient account deletion

### 2.4 Specialty Management

##### FR-SPECIALTY-001: Create Specialty

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As an admin, I want to create medical specialties so that doctors can be categorized by their expertise. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-001.1 | System must create specialty | - Accept title and icon (optional)<br>- Generate unique ID<br>- Store in Specialty table<br>- Return created specialty |
| FR-SPECIALTY-001.2 | System must validate specialty data | - Title required (2-100 chars)<br>- Title must be unique (case-insensitive)<br>- Icon optional (valid URL or emoji)<br>- Sanitize inputs |
| FR-SPECIALTY-001.3 | System must enforce authorization | - Only SUPER_ADMIN and ADMIN can create<br>- Return 403 for other roles |
| FR-SPECIALTY-001.4 | System must handle duplicates | - Check existing specialty by title<br>- Return 409 if duplicate found<br>- Case-insensitive comparison |

###### Input Validation

```ts
{
  title: string (required, 2-100 chars, unique),
  icon: string (optional, max 500 chars)
}
```

###### Success Response

**Status:** HTTP 201 Created

```json
{
  "success": true,
  "message": "Specialty created successfully",
  "data": {
    "id": "specialty-uuid",
    "title": "Cardiology",
    "icon": "❤️",
    "createdAt": "2026-01-29T10:00:00Z"
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Duplicate specialty title |  HTTP 409 Conflict |
| Invalid input |  HTTP 400 Bad Request |
| Unauthorized |  HTTP 403 Forbidden |

##### FR-SPECIALTY-002: Update Specialty

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As an admin, I want to update specialty information so that specialty details remain accurate. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-002.1 | System must update specialty | - Accept specialty ID and update data<br>- Update title and/or icon<br>- Partial update supported<br>- Return updated specialty |
| FR-SPECIALTY-002.2 | System must validate update data | - Title validation if provided (2-100 chars)<br>- Title uniqueness check (exclude self)<br>- Icon validation if provided |
| FR-SPECIALTY-002.3 | System must enforce authorization | - Only SUPER_ADMIN and ADMIN can update<br>- Return 403 for other roles |
| FR-SPECIALTY-002.4 | System must validate specialty exists | - Return 404 if specialty not found<br>- Check soft-deleted status |

###### Input Validation (All fields optional)

```ts
{
  title: string (optional, 2-100 chars, unique),
  icon: string (optional, max 500 chars)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Specialty updated successfully",
  "data": {
    "id": "specialty-uuid",
    "title": "Cardiology",
    "icon": "🫀",
    "createdAt": "2026-01-29T10:00:00Z",
    "updatedAt": "2026-01-29T12:00:00Z"
  }
}
```

##### FR-SPECIALTY-003: Get Specialty List

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a user, I want to view all medical specialties so that I can find doctors by specialty. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-003.1 | System must return all specialties | - List all active specialties<br>- Exclude soft-deleted<br>- No authentication required (public endpoint) |
| FR-SPECIALTY-003.2 | System must include doctor count | - Count active doctors per specialty<br>- Use DoctorSpecialty junction table<br>- Exclude deleted doctors |
| FR-SPECIALTY-003.3 | System must support pagination | - Default: page=1, limit=20<br>- Support page and limit params<br>- Return total count |
| FR-SPECIALTY-003.4 | System must support search | - Search by specialty title<br>- Case-insensitive search<br>- Partial match support |
| FR-SPECIALTY-003.5 | System must implement caching | - Cache specialty list (TTL: 1 hour)<br>- Invalidate on create/update/delete<br>- Reduce database load |

###### Query Parameters

```ts
{
  page: number (default: 1, min: 1),
  limit: number (default: 20, max: 100),
  searchTerm: string (optional, search title)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Specialties retrieved successfully",
  "data": [
    {
      "id": "specialty-uuid",
      "title": "Cardiology",
      "icon": "❤️",
      "doctorCount": 15,
      "createdAt": "2026-01-29T10:00:00Z"
    },
    {
      "id": "specialty-uuid-2",
      "title": "Neurology",
      "icon": "🧠",
      "doctorCount": 8,
      "createdAt": "2026-01-29T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

##### FR-SPECIALTY-004: Delete Specialty

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As an admin, I want to soft-delete unused specialties so that specialty list remains relevant. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-004.1 | System must soft-delete specialty | - Set isDeleted = true<br>- Preserve data (not permanent delete)<br>- Update timestamp |
| FR-SPECIALTY-004.2 | System must check dependencies | - Cannot delete if doctors assigned<br>- Must reassign doctors first<br>- Return appropriate error |
| FR-SPECIALTY-004.3 | System must enforce authorization | - Only SUPER_ADMIN can delete<br>- Return 403 for other roles |
| FR-SPECIALTY-004.4 | System must invalidate cache | - Clear specialty cache<br>- Clear doctor cache (affected doctors)<br>- Ensure consistency |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Specialty deleted successfully",
  "data": {
    "id": "specialty-uuid",
    "title": "Cardiology",
    "isDeleted": true
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Specialty has assigned doctors |  HTTP 409 Conflict |
| Specialty not found |  HTTP 404 Not Found |
| Unauthorized |  HTTP 403 Forbidden |

###### Business Rules

- Cannot delete specialty with active doctors (must reassign first)
- Deleted specialties hidden from public list
- Super admin can restore deleted specialties
- Minimum 5 specialties must exist in system

### 2.5 Schedule Management

##### FR-SCHEDULE-001: Create Doctor Schedule

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a doctor, I want to create my availability schedule so that patients can book appointments. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-001.1 | System must create schedule | - Accept date, start time, end time<br>- Link to doctor via DoctorSchedule junction<br>- Generate unique schedule ID<br>- Store in Schedule table |
| FR-SCHEDULE-001.2 | System must validate schedule data | - Date: future or today<br>- Start time: HH:mm format<br>- End time: after start time<br>- Duration: min 30 min, max 12 hours |
| FR-SCHEDULE-001.3 | System must prevent overlaps | - Check existing schedules for doctor<br>- No time overlap allowed<br>- Same date conflict detection<br>- Return 409 if overlap found |
| FR-SCHEDULE-001.4 | System must enforce authorization | - Doctor can create own schedule<br>- Admin can create for any doctor<br>- Return 403 for unauthorized access |
| FR-SCHEDULE-001.5 | System must handle bulk creation | - Support creating multiple time slots<br>- Atomic transaction (all or nothing)<br>- Rollback on any failure |

###### Input Validation

```ts
{
  scheduleDate: string (required, ISO date, today or future),
  startTime: string (required, HH:mm format),
  endTime: string (required, HH:mm format, after startTime)
}
```

###### Bulk Creation

```ts
{
  schedules: [
    {
      scheduleDate: "2026-02-01",
      startTime: "09:00",
      endTime: "12:00",
    },
    {
      scheduleDate: "2026-02-01",
      startTime: "14:00",
      endTime: "17:00",
    },
  ];
}
```

###### Success Response

**Status:** HTTP 201 Created

```json
{
  "success": true,
  "message": "Schedule created successfully",
  "data": {
    "id": "schedule-uuid",
    "doctorId": "doctor-uuid",
    "scheduleDate": "2026-02-01",
    "startTime": "09:00",
    "endTime": "12:00",
    "isBooked": false,
    "createdAt": "2026-01-29T10:00:00Z"
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Time overlap |  HTTP 409 Conflict |
| Past date |  HTTP 400 Bad Request |
| Invalid time format |  HTTP 400 Bad Request |
| Unauthorized |  HTTP 403 Forbidden |

##### FR-SCHEDULE-002: Get Doctor Schedule

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a patient, I want to view doctor availability so that I can book an appointment. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-002.1 | System must return doctor schedules | - Filter by doctor ID<br>- Filter by date range<br>- Show only available (not booked) slots<br>- Sort by date and time ascending |
| FR-SCHEDULE-002.2 | System must support date filtering | - Filter by specific date<br>- Filter by date range (start/end)<br>- Default: next 7 days<br>- Exclude past dates |
| FR-SCHEDULE-002.3 | System must show booking status | - isBooked flag for each slot<br>- Hide fully booked slots by default<br>- Option to show all (for doctor/admin) |
| FR-SCHEDULE-002.4 | System must implement caching | - Cache schedules per doctor (TTL: 5 min)<br>- Invalidate on schedule changes<br>- Invalidate on booking |
| FR-SCHEDULE-002.5 | System must include doctor info | - Include doctor name, specialty<br>- Include appointment fee<br>- Public endpoint (no auth for viewing) |

###### Query Parameters

```ts
{
  doctorId: string (required),
  startDate: string (optional, ISO date, default: today),
  endDate: string (optional, ISO date, default: today + 7 days),
  showBooked: boolean (optional, default: false)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor schedules retrieved successfully",
  "data": {
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. John Smith",
      "specialty": "Cardiology",
      "appointmentFee": 500
    },
    "schedules": [
      {
        "id": "schedule-uuid",
        "scheduleDate": "2026-02-01",
        "startTime": "09:00",
        "endTime": "12:00",
        "isBooked": false
      },
      {
        "id": "schedule-uuid-2",
        "scheduleDate": "2026-02-01",
        "startTime": "14:00",
        "endTime": "17:00",
        "isBooked": false
      }
    ]
  }
}
```

##### FR-SCHEDULE-003: Update Doctor Schedule

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a doctor, I want to modify my schedule so that I can adjust my availability. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-003.1 | System must update schedule | - Update date, start time, or end time<br>- Partial update supported<br>- Preserve other fields |
| FR-SCHEDULE-003.2 | System must validate constraints | - Cannot update if already booked<br>- Must maintain time logic (end > start)<br>- No overlap with other schedules |
| FR-SCHEDULE-003.3 | System must enforce authorization | - Doctor can update own schedule<br>- Admin can update any schedule<br>- Return 403 for unauthorized |
| FR-SCHEDULE-003.4 | System must invalidate cache | - Clear doctor schedule cache<br>- Clear appointment cache if linked<br>- Update in real-time |

###### Input Validation (All fields optional)

```ts
{
  scheduleDate: string (optional, ISO date, today or future),
  startTime: string (optional, HH:mm format),
  endTime: string (optional, HH:mm format, after startTime)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Schedule updated successfully",
  "data": {
    "id": "schedule-uuid",
    "doctorId": "doctor-uuid",
    "scheduleDate": "2026-02-01",
    "startTime": "10:00",
    "endTime": "13:00",
    "isBooked": false,
    "updatedAt": "2026-01-29T11:00:00Z"
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Schedule already booked |  HTTP 409 Conflict |
| Time overlap |  HTTP 409 Conflict |
| Schedule not found |  HTTP 404 Not Found |

##### FR-SCHEDULE-004: Delete Doctor Schedule

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a doctor, I want to delete my schedule slots so that I can remove unavailable times. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-004.1 | System must soft-delete schedule | - Set isDeleted = true<br>- Cannot delete if booked<br>- Preserve for audit trail |
| FR-SCHEDULE-004.2 | System must check booking status | - Return 409 if schedule has appointment<br>- Must cancel appointment first<br>- Clear error message |
| FR-SCHEDULE-004.3 | System must enforce authorization | - Doctor can delete own schedule<br>- Admin can delete any schedule<br>- Return 403 for unauthorized |
| FR-SCHEDULE-004.4 | System must invalidate cache | - Clear doctor schedule cache<br>- Update availability count<br>- Real-time update |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Schedule deleted successfully",
  "data": {
    "id": "schedule-uuid",
    "isDeleted": true
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Schedule has booking |  HTTP 409 Conflict |
| Schedule not found |  HTTP 404 Not Found |
| Unauthorized |  HTTP 403 Forbidden |

###### Business Rules

- Cannot delete schedule within 24 hours of start time if booked
- Cannot delete past schedules (archive only)
- Doctors must have at least one schedule per week (warning if none)
- Maximum 10 schedules per day per doctor
- Schedule slots automatically marked unavailable after end time

## 3. Appointment Management Module

### 3.1 Core Appointment Operations

##### FR-APPOINTMENT-001: Create Appointment (Book Appointment)

| Field | Value |
| --- | --- |
| Priority | CRITICAL |
| User Story | As a patient, I want to book an appointment with a doctor so that I can receive medical consultation. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-001.1 | System must create appointment | - Link patient, doctor, and schedule<br>- Generate unique appointment ID<br>- Set initial status to SCHEDULED<br>- Store in Appointment table |
| FR-APPOINTMENT-001.2 | System must validate booking constraints | - Schedule must exist and be available<br>- Schedule not already booked<br>- Patient cannot double-book same time slot<br>- Doctor must be active (not deleted/blocked) |
| FR-APPOINTMENT-001.3 | System must mark schedule as booked | - Update Schedule.isBooked = true<br>- Atomic transaction with appointment creation<br>- Prevent race conditions (use DB locking) |
| FR-APPOINTMENT-001.4 | System must initiate payment | - Calculate appointment fee from doctor<br>- Create Payment record with status PENDING<br>- Link payment to appointment<br>- Return payment initiation data |
| FR-APPOINTMENT-001.5 | System must enforce authorization | - Only authenticated patients can book<br>- Patient can only book for themselves<br>- Admin can book for any patient |
| FR-APPOINTMENT-001.6 | System must send notifications | - Email confirmation to patient<br>- Email notification to doctor<br>- Include appointment details<br>- Include payment link |
| FR-APPOINTMENT-001.7 | System must handle video call link | - Generate unique video call URL<br>- Store in videoCallingId field<br>- Send to both patient and doctor<br>- Available 15 min before appointment |

###### Input Validation

```ts
{
  doctorId: string (required, valid UUID),
  scheduleId: string (required, valid UUID),
  patientId: string (required, valid UUID),
  notes: string (optional, max 1000 chars, patient notes)
}
```

###### Success Response

**Status:** HTTP 201 Created

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "appointment": {
      "id": "appointment-uuid",
      "patientId": "patient-uuid",
      "doctorId": "doctor-uuid",
      "scheduleId": "schedule-uuid",
      "status": "SCHEDULED",
      "videoCallingId": "meeting-id-xyz",
      "createdAt": "2026-01-29T10:00:00Z"
    },
    "payment": {
      "id": "payment-uuid",
      "appointmentId": "appointment-uuid",
      "amount": 500,
      "status": "PENDING",
      "paymentLink": "https://payment-gateway.com/pay/xyz"
    },
    "schedule": {
      "scheduleDate": "2026-02-01",
      "startTime": "09:00",
      "endTime": "12:00"
    }
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Schedule already booked |  HTTP 409 Conflict |
| Schedule not found |  HTTP 404 Not Found |
| Doctor inactive/deleted |  HTTP 400 Bad Request |
| Patient double-booking |  HTTP 409 Conflict |
| Past date/time |  HTTP 400 Bad Request |

###### Business Logic

- Validate schedule availability
- Check patient doesn’t have overlapping appointment
- Create appointment record (status: SCHEDULED)
- Mark schedule as booked
- Create payment record (status: PENDING)
- Generate video call link
- Send notification emails
- Commit transaction or rollback all

##### FR-APPOINTMENT-002: Get Patient Appointments

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a patient, I want to view my appointments so that I can track my upcoming and past consultations. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-002.1 | System must return patient appointments | - Filter by patient ID<br>- Include doctor details<br>- Include schedule details<br>- Include payment status |
| FR-APPOINTMENT-002.2 | System must support status filtering | - Filter by status (SCHEDULED, COMPLETED, CANCELLED)<br>- Default: all statuses<br>- Multiple status selection |
| FR-APPOINTMENT-002.3 | System must support date filtering | - Filter by date range<br>- Filter upcoming appointments<br>- Filter past appointments<br>- Default: all dates |
| FR-APPOINTMENT-002.4 | System must implement pagination | - Default: page=1, limit=10<br>- Sort by appointment date DESC<br>- Include total count |
| FR-APPOINTMENT-002.5 | System must enforce authorization | - Patient can view own appointments only<br>- Admin can view all appointments<br>- Doctor can view their appointments |

###### Query Parameters

```ts
{
  page: number (default: 1),
  limit: number (default: 10, max: 100),
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'INPROGRESS' (optional),
  startDate: string (optional, ISO date),
  endDate: string (optional, ISO date),
  upcoming: boolean (optional, future appointments only)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Appointments retrieved successfully",
  "data": [
    {
      "id": "appointment-uuid",
      "status": "SCHEDULED",
      "videoCallingId": "meeting-id-xyz",
      "createdAt": "2026-01-29T10:00:00Z",
      "doctor": {
        "id": "doctor-uuid",
        "name": "Dr. John Smith",
        "specialty": "Cardiology",
        "profilePhoto": "https://example.com/photo.jpg"
      },
      "schedule": {
        "scheduleDate": "2026-02-01",
        "startTime": "09:00",
        "endTime": "12:00"
      },
      "payment": {
        "id": "payment-uuid",
        "amount": 500,
        "status": "PAID"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

##### FR-APPOINTMENT-003: Get Doctor Appointments

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a doctor, I want to view my appointments so that I can manage my patient consultations. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-003.1 | System must return doctor appointments | - Filter by doctor ID<br>- Include patient details<br>- Include schedule details<br>- Include payment status |
| FR-APPOINTMENT-003.2 | System must support filtering | - Filter by status<br>- Filter by date range<br>- Filter by patient name<br>- Filter by payment status |
| FR-APPOINTMENT-003.3 | System must implement pagination | - Default: page=1, limit=20<br>- Sort by appointment date ASC<br>- Group by date |
| FR-APPOINTMENT-003.4 | System must show patient health summary | - Include basic health data<br>- Include allergies (critical info)<br>- Include chronic conditions<br>- Privacy compliant |
| FR-APPOINTMENT-003.5 | System must enforce authorization | - Doctor can view own appointments only<br>- Admin can view all appointments<br>- Patient cannot access doctor view |

###### Query Parameters

```ts
{
  page: number (default: 1),
  limit: number (default: 20, max: 100),
  status: AppointmentStatus (optional),
  date: string (optional, specific date),
  patientSearch: string (optional, search patient name)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor appointments retrieved successfully",
  "data": [
    {
      "id": "appointment-uuid",
      "status": "SCHEDULED",
      "videoCallingId": "meeting-id-xyz",
      "patient": {
        "id": "patient-uuid",
        "name": "John Doe",
        "contactNumber": "+1234567890",
        "healthSummary": {
          "bloodGroup": "A_POSITIVE",
          "allergies": "Penicillin",
          "chronicConditions": "None"
        }
      },
      "schedule": {
        "scheduleDate": "2026-02-01",
        "startTime": "09:00",
        "endTime": "12:00"
      },
      "payment": {
        "status": "PAID",
        "amount": 500
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

##### FR-APPOINTMENT-004: Update Appointment Status

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a doctor/patient, I want to update appointment status so that appointment lifecycle is tracked. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-004.1 | System must update appointment status | - Accept new status<br>- Validate status transition<br>- Update timestamp<br>- Log status change |
| FR-APPOINTMENT-004.2 | System must validate status transitions | - SCHEDULED → INPROGRESS → COMPLETED<br>- SCHEDULED → CANCELLED<br>- Cannot revert COMPLETED/CANCELLED<br>- Return 400 for invalid transitions |
| FR-APPOINTMENT-004.3 | System must handle cancellation logic | - If cancelled, release schedule (isBooked = false)<br>- Process refund if applicable<br>- Update payment status<br>- Send cancellation notifications |
| FR-APPOINTMENT-004.4 | System must enforce authorization | - Patient can cancel only SCHEDULED status<br>- Doctor can update to INPROGRESS/COMPLETED<br>- Admin can update any status |
| FR-APPOINTMENT-004.5 | System must enforce time constraints | - Cannot start appointment >15 min before schedule<br>- Cannot complete without INPROGRESS status<br>- Auto-complete after 24 hours if INPROGRESS |

###### Input Validation

```ts
{
  status: "SCHEDULED" | "INPROGRESS" | "COMPLETED" | "CANCELLED"(required);
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "id": "appointment-uuid",
    "status": "COMPLETED",
    "updatedAt": "2026-02-01T12:30:00Z"
  }
}
```

###### Status Transition Rules

- SCHEDULED → INPROGRESS (doctor only, within 15 min window)
- INPROGRESS → COMPLETED (doctor only, after consultation)
- SCHEDULED → CANCELLED (patient/doctor/admin, before start time)

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Invalid status transition |  HTTP 400 Bad Request |
| Too early to start |  HTTP 400 Bad Request |
| Already completed/cancelled |  HTTP 409 Conflict |
| Unauthorized role |  HTTP 403 Forbidden |

##### FR-APPOINTMENT-005: Cancel Appointment

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a patient/doctor, I want to cancel an appointment so that I can manage schedule changes. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-005.1 | System must cancel appointment | - Update status to CANCELLED<br>- Release schedule slot<br>- Process refund logic<br>- Send notifications |
| FR-APPOINTMENT-005.2 | System must enforce cancellation policy | - Patient: can cancel up to 24 hours before<br>- Doctor: can cancel up to 12 hours before<br>- Admin: can cancel anytime<br>- Apply cancellation fees based on timing |
| FR-APPOINTMENT-005.3 | System must handle payment refund | - Full refund if >24 hours before<br>- 50% refund if 12-24 hours before<br>- No refund if <12 hours before<br>- Update payment status to REFUNDED/PARTIAL_REFUND |
| FR-APPOINTMENT-005.4 | System must release schedule | - Set Schedule.isBooked = false<br>- Make slot available for rebooking<br>- Atomic transaction |
| FR-APPOINTMENT-005.5 | System must send notifications | - Email to patient (refund info)<br>- Email to doctor<br>- Include cancellation reason if provided |
| FR-APPOINTMENT-005.6 | System must log cancellation | - Record who cancelled (patient/doctor/admin)<br>- Record cancellation time<br>- Record cancellation reason<br>- Audit trail for disputes |

###### Input Validation

```ts
{
  reason: string (optional, max 500 chars, cancellation reason)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "id": "appointment-uuid",
    "status": "CANCELLED",
    "refund": {
      "type": "FULL",
      "amount": 500,
      "processedAt": "2026-01-29T10:00:00Z"
    },
    "cancelledBy": "patient-uuid",
    "cancelledAt": "2026-01-29T10:00:00Z"
  }
}
```

###### Cancellation Policy

- >24 hours before: 100% refund
- 12-24 hours before: 50% refund
- <12 hours before: No refund (emergency only)
- No-show: No refund

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Appointment already started (INPROGRESS) |  HTTP 409 Conflict |
| Appointment already completed |  HTTP 409 Conflict |
| Within no-cancellation window |  HTTP 400 Bad Request (with policy info) |

##### FR-APPOINTMENT-006: Get Appointment by ID

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a user, I want to view detailed appointment information so that I can access all related data. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-006.1 | System must return complete appointment | - All appointment fields<br>- Patient details<br>- Doctor details<br>- Schedule details<br>- Payment details |
| FR-APPOINTMENT-006.2 | System must include related records | - Include prescription if exists<br>- Include review if exists<br>- Include patient health data (for doctor)<br>- Exclude sensitive data based on role |
| FR-APPOINTMENT-006.3 | System must enforce authorization | - Patient can view own appointments<br>- Doctor can view assigned appointments<br>- Admin can view all<br>- Return 403 for unauthorized |
| FR-APPOINTMENT-006.4 | System must provide video call info | - Video call link (if appointment today)<br>- Link active 15 min before start<br>- Link expires 1 hour after end<br>- Security token included |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Appointment retrieved successfully",
  "data": {
    "id": "appointment-uuid",
    "status": "SCHEDULED",
    "videoCallingId": "meeting-id-xyz",
    "videoCallLink": "https://video.example.com/meeting-id-xyz?token=xyz",
    "createdAt": "2026-01-29T10:00:00Z",
    "patient": {
      "id": "patient-uuid",
      "name": "John Doe",
      "contactNumber": "+1234567890"
    },
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. John Smith",
      "specialty": "Cardiology",
      "appointmentFee": 500
    },
    "schedule": {
      "scheduleDate": "2026-02-01",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    "payment": {
      "id": "payment-uuid",
      "amount": 500,
      "status": "PAID",
      "transactionId": "txn_xyz",
      "paidAt": "2026-01-29T10:05:00Z"
    },
    "prescription": null,
    "review": null
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Appointment not found |  HTTP 404 Not Found |
| Unauthorized access |  HTTP 403 Forbidden |

### 3.2 Appointment Search & Analytics

##### FR-APPOINTMENT-007: Search Appointments (Admin)

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As an admin, I want to search all appointments so that I can monitor system activity. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-APPOINTMENT-007.1 | System must support comprehensive search | - Search by patient name/email<br>- Search by doctor name<br>- Filter by status<br>- Filter by date range |
| FR-APPOINTMENT-007.2 | System must support advanced filtering | - Filter by payment status<br>- Filter by specialty<br>- Filter by appointment fee range<br>- Combine multiple filters |
| FR-APPOINTMENT-007.3 | System must implement pagination | - Default: page=1, limit=20<br>- Sort by multiple fields<br>- Include total count |
| FR-APPOINTMENT-007.4 | System must include analytics | - Total appointments count<br>- Status breakdown<br>- Revenue statistics<br>- Popular specialties |
| FR-APPOINTMENT-007.5 | System must enforce admin authorization | - Only SUPER_ADMIN and ADMIN access<br>- Return 403 for other roles |

###### Query Parameters

```ts
{
  page: number (default: 1),
  limit: number (default: 20, max: 100),
  patientSearch: string (optional),
  doctorSearch: string (optional),
  status: AppointmentStatus (optional),
  paymentStatus: PaymentStatus (optional),
  startDate: string (optional, ISO date),
  endDate: string (optional, ISO date),
  specialty: string (optional),
  minFee: number (optional),
  maxFee: number (optional),
  sortBy: string (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Appointments retrieved successfully",
  "data": [...],
  "analytics": {
    "totalAppointments": 1250,
    "statusBreakdown": {
      "SCHEDULED": 450,
      "COMPLETED": 650,
      "CANCELLED": 150
    },
    "totalRevenue": 625000,
    "averageFee": 500
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63
  }
}
```

###### Business Rules (Appointment Module)

- Patient cannot book more than 5 appointments per month
- Appointments auto-cancelled if payment not completed within 30 minutes
- Video call links expire 1 hour after appointment end time
- Doctor can see patient health data only for their appointments
- Appointment slots released immediately upon cancellation
- No-show appointments (not cancelled, not attended) marked COMPLETED after 24 hours
- Patients cannot book same doctor within 7 days (spam prevention)
- Emergency appointments bypass normal booking rules (admin only)

## 4. Payment Management Module (Stripe Integration)

### 4.1 Payment Processing

##### FR-PAYMENT-001: Initiate Payment

| Field | Value |
| --- | --- |
| Priority | CRITICAL |
| User Story | As a patient, I want to pay for my appointment so that my booking is confirmed. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-001.1 | System must create payment record | - Create Payment entry when appointment booked<br>- Link to appointment (appointmentId)<br>- Set status to PENDING<br>- Store amount from doctor fee |
| FR-PAYMENT-001.2 | System must integrate with Stripe | - Create Stripe Payment Intent<br>- Use Stripe API v2023+<br>- Handle currency (USD default)<br>- Return client secret for frontend |
| FR-PAYMENT-001.3 | System must generate payment link | - Create checkout session URL<br>- Include appointment details<br>- Set success/cancel redirect URLs<br>- Include metadata (appointmentId, patientId) |
| FR-PAYMENT-001.4 | System must set payment expiry | - Payment valid for 30 minutes<br>- Auto-cancel appointment if expired<br>- Release schedule slot<br>- Send expiry notification |
| FR-PAYMENT-001.5 | System must enforce security | - Validate payment amount matches appointment<br>- Prevent amount tampering<br>- Use idempotency keys<br>- Log all payment attempts |

###### Input (Internal - called during appointment creation)

```ts
{
  appointmentId: string (required, valid UUID),
  amount: number (required, from doctor.appointmentFee),
  currency: string (default: 'USD')
}
```

###### Success Response

**Status:** HTTP 201 Created

```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "paymentId": "payment-uuid",
    "appointmentId": "appointment-uuid",
    "amount": 500,
    "currency": "USD",
    "status": "PENDING",
    "stripePaymentIntentId": "pi_xxx",
    "clientSecret": "pi_xxx_secret_yyy",
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_xxx",
    "expiresAt": "2026-01-29T10:30:00Z"
  }
}
```

###### Business Logic

- Create Payment record (status: PENDING)
- Create Stripe Payment Intent
- Store Stripe payment intent ID
- Return payment data to frontend
- Start 30-minute expiry timer
- Listen for Stripe webhook events

##### FR-PAYMENT-002: Process Payment Webhook

| Field | Value |
| --- | --- |
| Priority | CRITICAL |
| User Story | As the system, I want to process Stripe webhook events so that payment status is updated in real-time. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-002.1 | System must verify webhook signature | - Validate Stripe signature<br>- Use webhook secret from env<br>- Reject invalid signatures<br>- Prevent replay attacks |
| FR-PAYMENT-002.2 | System must handle payment success event | - Event: payment_intent.succeeded<br>- Update Payment status to PAID<br>- Store transaction ID<br>- Record payment timestamp |
| FR-PAYMENT-002.3 | System must confirm appointment | - Update appointment status if needed<br>- Send confirmation email<br>- Activate video call link<br>- Send SMS notification (optional) |
| FR-PAYMENT-002.4 | System must handle payment failure | - Event: payment_intent.payment_failed<br>- Update Payment status to FAILED<br>- Cancel appointment<br>- Release schedule slot<br>- Notify patient |
| FR-PAYMENT-002.5 | System must handle idempotency | - Check if event already processed<br>- Store processed event IDs<br>- Prevent duplicate processing<br>- Return 200 for duplicates |
| FR-PAYMENT-002.6 | System must log webhook events | - Log all webhook calls<br>- Store event type and data<br>- Audit trail for disputes<br>- Debug failed transactions |

###### Webhook Events Handled

```ts
{
  'payment_intent.succeeded': handlePaymentSuccess,
  'payment_intent.payment_failed': handlePaymentFailure,
  'payment_intent.canceled': handlePaymentCancellation,
  'charge.refunded': handleRefund
}
```

###### Webhook Payload (from Stripe)

```json
{
  "id": "evt_xxx",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 50000,
      "currency": "usd",
      "status": "succeeded",
      "metadata": {
        "appointmentId": "appointment-uuid",
        "patientId": "patient-uuid"
      }
    }
  }
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "received": true
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Invalid signature |  HTTP 400 Bad Request |
| Unhandled event type |  HTTP 200 OK (logged) |
| Payment record not found |  HTTP 404 Not Found (logged, alert admin) |

##### FR-PAYMENT-003: Process Refund

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a patient, I want to receive refund when appointment is cancelled so that I get my money back. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-003.1 | System must calculate refund amount | - Apply cancellation policy<br>- Full refund: >24 hours before<br>- Partial refund: 12-24 hours before<br>- No refund: <12 hours before |
| FR-PAYMENT-003.2 | System must process Stripe refund | - Create Stripe refund<br>- Specify refund amount<br>- Include refund reason<br>- Store refund ID |
| FR-PAYMENT-003.3 | System must update payment record | - Update status to REFUNDED or PARTIAL_REFUND<br>- Store refund amount<br>- Store refund timestamp<br>- Link to Stripe refund ID |
| FR-PAYMENT-003.4 | System must handle refund webhook | - Event: charge.refunded<br>- Confirm refund processed<br>- Update local records<br>- Send confirmation email |
| FR-PAYMENT-003.5 | System must enforce refund rules | - Can only refund PAID payments<br>- Cannot refund already refunded<br>- Cannot exceed original amount<br>- Validate appointment cancellation |

###### Input (Internal - called during cancellation)

```ts
{
  paymentId: string (required, valid UUID),
  refundType: 'FULL' | 'PARTIAL' (required),
  reason: string (optional, cancellation reason)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "paymentId": "payment-uuid",
    "originalAmount": 500,
    "refundAmount": 500,
    "refundType": "FULL",
    "status": "REFUNDED",
    "stripeRefundId": "re_xxx",
    "refundedAt": "2026-01-29T10:00:00Z",
    "estimatedArrival": "2026-02-05T10:00:00Z"
  }
}
```

###### Refund Processing Time

- Credit cards: 5-10 business days
- Debit cards: 5-10 business days
- Varies by bank/country

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Payment not in PAID status |  HTTP 400 Bad Request |
| Already refunded |  HTTP 409 Conflict |
| Stripe refund failed |  HTTP 500 Internal Server Error (retry logic) |

##### FR-PAYMENT-004: Get Payment Details

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient/admin, I want to view payment details so that I can track transaction history. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-004.1 | System must return payment details | - All payment fields<br>- Appointment reference<br>- Stripe transaction IDs<br>- Payment timeline |
| FR-PAYMENT-004.2 | System must include transaction history | - Payment attempts<br>- Status changes<br>- Refund history<br>- Timestamps |
| FR-PAYMENT-004.3 | System must enforce authorization | - Patient can view own payments<br>- Doctor can view their appointment payments<br>- Admin can view all payments |
| FR-PAYMENT-004.4 | System must mask sensitive data | - Mask card details (if stored)<br>- Show last 4 digits only<br>- Hide full transaction IDs from patient<br>- Admin sees full details |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "id": "payment-uuid",
    "appointmentId": "appointment-uuid",
    "amount": 500,
    "currency": "USD",
    "status": "PAID",
    "paymentMethod": "card",
    "cardLast4": "4242",
    "stripePaymentIntentId": "pi_xxx",
    "transactionId": "ch_xxx",
    "createdAt": "2026-01-29T10:00:00Z",
    "paidAt": "2026-01-29T10:05:00Z",
    "refundHistory": []
  }
}
```

##### FR-PAYMENT-005: Get Payment History

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient, I want to view my payment history so that I can track my medical expenses. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-005.1 | System must return user payment list | - Filter by user (patient/doctor)<br>- Include appointment details<br>- Include doctor/patient info<br>- Paginated results |
| FR-PAYMENT-005.2 | System must support filtering | - Filter by status (PAID, PENDING, REFUNDED)<br>- Filter by date range<br>- Filter by amount range<br>- Search by appointment |
| FR-PAYMENT-005.3 | System must calculate totals | - Total amount paid<br>- Total refunded<br>- Net amount<br>- Tax breakdown (if applicable) |
| FR-PAYMENT-005.4 | System must support export | - Export as PDF (invoice format)<br>- Export as CSV<br>- Include all transactions<br>- Tax-compliant format |

###### Query Parameters

```ts
{
  page: number (default: 1),
  limit: number (default: 10, max: 100),
  status: PaymentStatus (optional),
  startDate: string (optional, ISO date),
  endDate: string (optional, ISO date),
  sortBy: string (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": [
    {
      "id": "payment-uuid",
      "amount": 500,
      "status": "PAID",
      "paidAt": "2026-01-29T10:05:00Z",
      "appointment": {
        "id": "appointment-uuid",
        "scheduleDate": "2026-02-01",
        "doctor": {
          "name": "Dr. John Smith",
          "specialty": "Cardiology"
        }
      }
    }
  ],
  "summary": {
    "totalPaid": 2500,
    "totalRefunded": 500,
    "netAmount": 2000,
    "transactionCount": 5
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 4.2 Payment Administration

##### FR-PAYMENT-006: Admin Payment Dashboard

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As an admin, I want to view payment analytics so that I can monitor revenue and transactions. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-006.1 | System must provide payment analytics | - Total revenue (all time, monthly, daily)<br>- Payment status breakdown<br>- Refund statistics<br>- Average transaction value |
| FR-PAYMENT-006.2 | System must show payment trends | - Revenue over time (chart data)<br>- Successful payment rate<br>- Failed payment analysis<br>- Refund rate |
| FR-PAYMENT-006.3 | System must list recent transactions | - Last 50 transactions<br>- Filter by status<br>- Search by patient/doctor<br>- Export capability |
| FR-PAYMENT-006.4 | System must handle manual actions | - Manual refund processing<br>- Resolve failed payments<br>- Update payment status (admin override)<br>- Add payment notes |
| FR-PAYMENT-006.5 | System must enforce admin authorization | - Only SUPER_ADMIN and ADMIN access<br>- Log all admin actions<br>- Audit trail for financial compliance |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Payment analytics retrieved successfully",
  "data": {
    "overview": {
      "totalRevenue": 125000,
      "monthlyRevenue": 25000,
      "todayRevenue": 2500,
      "totalTransactions": 250,
      "successRate": 95.5,
      "refundRate": 8.2
    },
    "statusBreakdown": {
      "PAID": 220,
      "PENDING": 15,
      "FAILED": 10,
      "REFUNDED": 5
    },
    "recentTransactions": [
      {
        "id": "payment-uuid",
        "amount": 500,
        "status": "PAID",
        "patient": "John Doe",
        "doctor": "Dr. Smith",
        "paidAt": "2026-01-29T10:05:00Z"
      }
    ]
  }
}
```

##### FR-PAYMENT-007: Generate Invoice

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient, I want to download invoice for my payment so that I can claim insurance reimbursement. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PAYMENT-007.1 | System must generate PDF invoice | - Professional invoice format<br>- Include company details<br>- Include patient details<br>- Include itemized charges |
| FR-PAYMENT-007.2 | System must include required information | - Invoice number (unique)<br>- Date of service<br>- Doctor information<br>- Payment details<br>- Tax information (if applicable) |
| FR-PAYMENT-007.3 | System must support tax compliance | - Tax ID/GST number<br>- Tax breakdown<br>- Compliant with local regulations<br>- Audit-ready format |
| FR-PAYMENT-007.4 | System must store invoice history | - Archive generated invoices<br>- Re-download capability<br>- Version tracking<br>- 7-year retention |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "invoiceNumber": "INV-2026-00123",
    "invoiceDate": "2026-01-29",
    "invoiceUrl": "https://s3.amazonaws.com/invoices/INV-2026-00123.pdf",
    "downloadUrl": "https://signed-url-expires-in-24hr"
  }
}
```

###### Invoice Contents

- Header: Company name, logo, contact info
- Invoice number and date
- Patient details (name, email)
- Service details (appointment with Dr. X)
- Amount breakdown
- Payment method
- Tax details (if applicable)
- Footer: Thank you message, terms & conditions

###### Business Rules (Payment Module)

- All payments processed through Stripe (PCI DSS compliant)
- Payment expires 30 minutes after appointment creation
- Refund processing time: 5-10 business days
- Failed payments trigger automatic appointment cancellation
- Maximum 3 payment retry attempts allowed
- Payments cannot be processed for cancelled appointments
- Admin can manually mark payment as completed (with justification)
- Invoice automatically generated upon successful payment
- Payment records retained indefinitely (financial compliance)
- Stripe webhook events must be processed within 5 seconds

## 5. Prescription Management Module

### 5.1 Prescription Operations

##### FR-PRESCRIPTION-001: Create Prescription

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a doctor, I want to create prescriptions for patients so that they can receive proper medication. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-001.1 | System must create prescription | - Link to appointment (appointmentId)<br>- Accept instructions and followup date<br>- Generate unique prescription ID<br>- Store in Prescription table |
| FR-PRESCRIPTION-001.2 | System must validate prescription data | - Appointment must exist and be COMPLETED<br>- Doctor must be appointment’s doctor<br>- Instructions required (min 10 chars)<br>- Follow-up date optional (future date) |
| FR-PRESCRIPTION-001.3 | System must prevent duplicates | - One prescription per appointment<br>- Return 409 if prescription exists<br>- Allow prescription updates instead |
| FR-PRESCRIPTION-001.4 | System must enforce authorization | - Only assigned doctor can create<br>- Appointment must be in COMPLETED status<br>- Return 403 for unauthorized |
| FR-PRESCRIPTION-001.5 | System must send notifications | - Email prescription to patient<br>- Include PDF attachment<br>- Include follow-up date<br>- Doctor copy for records |

###### Input Validation

```ts
{
  appointmentId: string (required, valid UUID),
  instructions: string (required, min 10 chars, max 5000 chars),
  followUpDate: string (optional, ISO date, future date)
}
```

###### Success Response

**Status:** HTTP 201 Created

```json
{
  "success": true,
  "message": "Prescription created successfully",
  "data": {
    "id": "prescription-uuid",
    "appointmentId": "appointment-uuid",
    "doctorId": "doctor-uuid",
    "patientId": "patient-uuid",
    "instructions": "Take medication as prescribed...",
    "followUpDate": "2026-02-15",
    "createdAt": "2026-01-29T10:00:00Z"
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Appointment not completed |  HTTP 400 Bad Request |
| Prescription already exists |  HTTP 409 Conflict |
| Unauthorized doctor |  HTTP 403 Forbidden |
| Appointment not found |  HTTP 404 Not Found |

##### FR-PRESCRIPTION-002: Update Prescription

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a doctor, I want to update prescription instructions so that I can correct or add information. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-002.1 | System must update prescription | - Update instructions and/or followUpDate<br>- Partial update supported<br>- Preserve other fields<br>- Update timestamp |
| FR-PRESCRIPTION-002.2 | System must validate update data | - Instructions validation if provided<br>- Follow-up date validation if provided<br>- Cannot change appointment link |
| FR-PRESCRIPTION-002.3 | System must maintain version history | - Log all prescription changes<br>- Store previous versions<br>- Audit trail for medical records<br>- Compliance requirement |
| FR-PRESCRIPTION-002.4 | System must enforce authorization | - Only original doctor can update<br>- Within 30 days of creation<br>- Admin can override with reason |
| FR-PRESCRIPTION-002.5 | System must notify patient | - Email updated prescription<br>- Highlight changes<br>- New PDF generated<br>- Version number included |

###### Input Validation (All fields optional)

```ts
{
  instructions: string (optional, min 10 chars, max 5000 chars),
  followUpDate: string (optional, ISO date, future date)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Prescription updated successfully",
  "data": {
    "id": "prescription-uuid",
    "instructions": "Updated medication instructions...",
    "followUpDate": "2026-02-20",
    "version": 2,
    "updatedAt": "2026-01-29T12:00:00Z"
  }
}
```

##### FR-PRESCRIPTION-003: Get Prescription by ID

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient/doctor, I want to view prescription details so that I can access medical instructions. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-003.1 | System must return complete prescription | - All prescription fields<br>- Doctor details<br>- Patient details<br>- Appointment details<br>- PDF download link |
| FR-PRESCRIPTION-003.2 | System must include related data | - Doctor name, specialty, license number<br>- Patient name, age<br>- Appointment date<br>- Prescription issue date |
| FR-PRESCRIPTION-003.3 | System must enforce authorization | - Patient can view own prescriptions<br>- Doctor can view prescriptions they issued<br>- Admin can view all<br>- Return 403 for unauthorized |
| FR-PRESCRIPTION-003.4 | System must generate PDF on demand | - Professional prescription format<br>- Include doctor signature (digital)<br>- Include hospital/clinic details<br>- Watermark for authenticity |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Prescription retrieved successfully",
  "data": {
    "id": "prescription-uuid",
    "instructions": "Medication instructions...",
    "followUpDate": "2026-02-15",
    "createdAt": "2026-01-29T10:00:00Z",
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. John Smith",
      "specialty": "Cardiology",
      "licenseNumber": "MED12345"
    },
    "patient": {
      "id": "patient-uuid",
      "name": "John Doe",
      "age": 35
    },
    "appointment": {
      "id": "appointment-uuid",
      "scheduleDate": "2026-02-01",
      "startTime": "09:00"
    },
    "pdfUrl": "https://signed-url-expires-in-24hr"
  }
}
```

##### FR-PRESCRIPTION-004: Get Patient Prescriptions

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient, I want to view all my prescriptions so that I can track my medication history. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-004.1 | System must return patient prescriptions | - Filter by patient ID<br>- Include doctor details<br>- Include appointment details<br>- Paginated results |
| FR-PRESCRIPTION-004.2 | System must support sorting | - Sort by creation date (default: DESC)<br>- Sort by follow-up date<br>- Sort by doctor name |
| FR-PRESCRIPTION-004.3 | System must support filtering | - Filter by date range<br>- Filter by doctor<br>- Filter by specialty<br>- Search in instructions |
| FR-PRESCRIPTION-004.4 | System must implement pagination | - Default: page=1, limit=10<br>- Include total count<br>- Return prescription summaries |
| FR-PRESCRIPTION-004.5 | System must enforce authorization | - Patient can view own prescriptions<br>- Doctor can view their issued prescriptions<br>- Admin can view all |

###### Query Parameters

```ts
{
  page: number (default: 1),
  limit: number (default: 10, max: 50),
  doctorId: string (optional, filter by doctor),
  startDate: string (optional, ISO date),
  endDate: string (optional, ISO date),
  sortBy: string (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Prescriptions retrieved successfully",
  "data": [
    {
      "id": "prescription-uuid",
      "instructions": "Medication instructions...",
      "followUpDate": "2026-02-15",
      "createdAt": "2026-01-29T10:00:00Z",
      "doctor": {
        "name": "Dr. John Smith",
        "specialty": "Cardiology"
      },
      "appointment": {
        "scheduleDate": "2026-02-01"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

##### FR-PRESCRIPTION-005: Generate Prescription PDF

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient, I want to download my prescription as PDF so that I can present it at pharmacy. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-005.1 | System must generate professional PDF | - Standard prescription format<br>- Include all required information<br>- Proper medical terminology<br>- Print-ready quality |
| FR-PRESCRIPTION-005.2 | System must include mandatory fields | - Doctor name, license number<br>- Patient name, age<br>- Date of prescription<br>- Medication instructions<br>- Follow-up date<br>- Doctor signature (digital) |
| FR-PRESCRIPTION-005.3 | System must add security features | - Unique prescription number<br>- QR code for verification<br>- Watermark (anti-forgery)<br>- Timestamp |
| FR-PRESCRIPTION-005.4 | System must store generated PDFs | - Upload to S3 or cloud storage<br>- Generate signed URL (24-hour expiry)<br>- Cache PDF (regenerate only if updated)<br>- 7-year retention |
| FR-PRESCRIPTION-005.5 | System must enforce authorization | - Patient can download own prescriptions<br>- Doctor can download issued prescriptions<br>- Admin can download all |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Prescription PDF generated successfully",
  "data": {
    "prescriptionId": "prescription-uuid",
    "pdfUrl": "https://s3.amazonaws.com/prescriptions/...",
    "downloadUrl": "https://signed-url-expires-in-24hr",
    "expiresAt": "2026-01-30T10:00:00Z",
    "fileSize": 125000
  }
}
```

###### PDF Layout

```text
┌─────────────────────────────────────────┐
│ HOSPITAL/CLINIC LOGO & NAME             │
│ Address, Phone, Email                   │
├─────────────────────────────────────────┤
│ PRESCRIPTION                            │
│                                         │
│ Prescription No: RX-2026-00123          │
│ Date: January 29, 2026                  │
│                                         │
│ Doctor: Dr. John Smith                  │
│ License: MED12345                       │
│ Specialty: Cardiology                   │
│                                         │
│ Patient: John Doe                       │
│ Age: 35 years                           │
│ Date of Birth: May 15, 1990             │
│                                         │
│ Rx:                                     │
│ [Medication instructions text]          │
│                                         │
│ Follow-up: February 15, 2026            │
│                                         │
│ ___________________________             │
│ Dr. John Smith (Digital Signature)      │
│                                         │
│ [QR Code for verification]              │
│ Watermark: VALID PRESCRIPTION           │
└─────────────────────────────────────────┘
```

### 5.2 Prescription Analytics

##### FR-PRESCRIPTION-006: Get Prescription Statistics (Doctor)

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As a doctor, I want to view my prescription statistics so that I can track my patient care. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-006.1 | System must calculate doctor statistics | - Total prescriptions issued<br>- Prescriptions this month<br>- Average prescriptions per day<br>- Patients prescribed |
| FR-PRESCRIPTION-006.2 | System must provide time-based analysis | - Prescriptions by month (last 12 months)<br>- Prescriptions by day of week<br>- Peak prescription hours |
| FR-PRESCRIPTION-006.3 | System must show follow-up analytics | - Upcoming follow-ups count<br>- Overdue follow-ups<br>- Follow-up compliance rate |
| FR-PRESCRIPTION-006.4 | System must enforce authorization | - Doctor can view own statistics only<br>- Admin can view all doctor statistics |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Prescription statistics retrieved successfully",
  "data": {
    "overview": {
      "totalPrescriptions": 245,
      "thisMonthPrescriptions": 35,
      "averagePerDay": 1.2,
      "uniquePatients": 180
    },
    "trends": {
      "byMonth": [
        { "month": "2025-12", "count": 28 },
        { "month": "2026-01", "count": 35 }
      ]
    },
    "followUps": {
      "upcoming": 15,
      "overdue": 3,
      "complianceRate": 87.5
    }
  }
}
```

##### FR-PRESCRIPTION-007: Admin Prescription Dashboard

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As an admin, I want to view prescription analytics so that I can monitor system usage. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-PRESCRIPTION-007.1 | System must provide overall statistics | - Total prescriptions in system<br>- Prescriptions today/week/month<br>- Growth rate<br>- Top prescribing doctors |
| FR-PRESCRIPTION-007.2 | System must show doctor performance | - Prescriptions per doctor<br>- Average prescription length<br>- Follow-up compliance by doctor |
| FR-PRESCRIPTION-007.3 | System must enforce admin authorization | - Only SUPER_ADMIN and ADMIN access<br>- Return 403 for other roles |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Admin prescription dashboard retrieved successfully",
  "data": {
    "overview": {
      "totalPrescriptions": 5420,
      "todayPrescriptions": 45,
      "weekPrescriptions": 280,
      "monthPrescriptions": 1250,
      "growthRate": 12.5
    },
    "topDoctors": [
      {
        "doctorId": "doctor-uuid",
        "doctorName": "Dr. John Smith",
        "prescriptionCount": 245,
        "specialty": "Cardiology"
      }
    ]
  }
}
```

###### Business Rules (Prescription Module)

- Prescriptions can only be created for COMPLETED appointments
- One prescription per appointment (prevent duplicates)
- Prescriptions can be updated within 30 days by original doctor
- PDF prescriptions include QR code for verification
- Prescription records retained for 7 years (medical compliance)
- Follow-up date must be within 6 months of prescription date
- Patients receive automatic follow-up reminders (7 days before)
- Doctor license number must be verified before prescription creation
- Prescription PDFs watermarked for authenticity
- Admin cannot create prescriptions (only doctors)

## 6. Review Management Module

### 6.1 Review Operations

##### FR-REVIEW-001: Create Review

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient, I want to review my doctor after appointment so that I can share my experience. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-001.1 | System must create review | - Link to appointment (appointmentId)<br>- Accept rating (1-5) and comment<br>- Generate unique review ID<br>- Store in Review table |
| FR-REVIEW-001.2 | System must validate review constraints | - Appointment must be COMPLETED<br>- Patient must be appointment’s patient<br>- One review per appointment<br>- Rating: integer 1-5 |
| FR-REVIEW-001.3 | System must validate review content | - Rating required (1-5 stars)<br>- Comment optional (max 1000 chars)<br>- Comment sanitized (XSS prevention)<br>- Profanity filter applied |
| FR-REVIEW-001.4 | System must update doctor statistics | - Recalculate average rating<br>- Update total review count<br>- Update doctor profile cache<br>- Real-time rating update |
| FR-REVIEW-001.5 | System must enforce authorization | - Only appointment patient can review<br>- Can review within 30 days of completion<br>- Return 403 for unauthorized |
| FR-REVIEW-001.6 | System must send notifications | - Email notification to doctor<br>- Include rating and comment<br>- Option for doctor to respond |

###### Input Validation

```ts
{
  appointmentId: string (required, valid UUID),
  rating: number (required, integer, 1-5),
  comment: string (optional, max 1000 chars)
}
```

###### Success Response

**Status:** HTTP 201 Created

```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "review-uuid",
    "appointmentId": "appointment-uuid",
    "patientId": "patient-uuid",
    "doctorId": "doctor-uuid",
    "rating": 5,
    "comment": "Excellent doctor, very caring and professional.",
    "createdAt": "2026-01-29T10:00:00Z"
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Appointment not completed |  HTTP 400 Bad Request |
| Review already exists |  HTTP 409 Conflict |
| Review period expired (>30 days) |  HTTP 400 Bad Request |
| Unauthorized patient |  HTTP 403 Forbidden |

##### FR-REVIEW-002: Update Review

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As a patient, I want to edit my review so that I can correct or update my feedback. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-002.1 | System must update review | - Update rating and/or comment<br>- Partial update supported<br>- Preserve other fields<br>- Update timestamp |
| FR-REVIEW-002.2 | System must validate update constraints | - Can update within 7 days of creation<br>- Rating validation if changed<br>- Comment validation if changed |
| FR-REVIEW-002.3 | System must recalculate doctor rating | - Update doctor average rating<br>- Invalidate doctor cache<br>- Real-time update |
| FR-REVIEW-002.4 | System must enforce authorization | - Only review author can update<br>- Within edit time window (7 days)<br>- Admin cannot edit patient reviews |

###### Input Validation (All fields optional)

```ts
{
  rating: number (optional, integer, 1-5),
  comment: string (optional, max 1000 chars)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": "review-uuid",
    "rating": 4,
    "comment": "Updated: Good experience overall.",
    "updatedAt": "2026-01-29T12:00:00Z"
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Edit window expired |  HTTP 400 Bad Request |
| Review not found |  HTTP 404 Not Found |
| Unauthorized |  HTTP 403 Forbidden |

##### FR-REVIEW-003: Get Doctor Reviews

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a user, I want to view doctor reviews so that I can choose the right doctor. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-003.1 | System must return doctor reviews | - Filter by doctor ID<br>- Include patient name (anonymized option)<br>- Include rating and comment<br>- Include date |
| FR-REVIEW-003.2 | System must support pagination | - Default: page=1, limit=10<br>- Sort by rating (high/low)<br>- Sort by date (newest/oldest)<br>- Include total count |
| FR-REVIEW-003.3 | System must support filtering | - Filter by rating (e.g., 5-star only)<br>- Filter by date range<br>- Verified reviews only option |
| FR-REVIEW-003.4 | System must include summary statistics | - Average rating<br>- Total reviews<br>- Rating distribution (1-5 stars)<br>- Percentage breakdown |
| FR-REVIEW-003.5 | System must implement anonymization | - Option to hide patient full name<br>- Show only first name + initial<br>- Configurable per patient |
| FR-REVIEW-003.6 | System must be public | - No authentication required<br>- Publicly accessible endpoint<br>- Cache for performance (TTL: 15 min) |

###### Query Parameters

```ts
{
  doctorId: string (required),
  page: number (default: 1),
  limit: number (default: 10, max: 50),
  rating: number (optional, filter by specific rating),
  sortBy: 'rating' | 'createdAt' (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Doctor reviews retrieved successfully",
  "data": {
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. John Smith",
      "specialty": "Cardiology",
      "averageRating": 4.7,
      "totalReviews": 150
    },
    "ratingDistribution": {
      "5": 100,
      "4": 35,
      "3": 10,
      "2": 3,
      "1": 2
    },
    "reviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "comment": "Excellent doctor!",
        "patientName": "John D.",
        "createdAt": "2026-01-29T10:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

##### FR-REVIEW-004: Get Patient Reviews

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As a patient, I want to view my submitted reviews so that I can track my feedback history. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-004.1 | System must return patient reviews | - Filter by patient ID<br>- Include doctor details<br>- Include appointment details<br>- Show edit status |
| FR-REVIEW-004.2 | System must support pagination | - Default: page=1, limit=10<br>- Sort by creation date DESC<br>- Include total count |
| FR-REVIEW-004.3 | System must indicate editability | - Flag if still editable (within 7 days)<br>- Show time remaining for edit<br>- Show last updated timestamp |
| FR-REVIEW-004.4 | System must enforce authorization | - Patient can view own reviews only<br>- Admin can view all reviews |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Patient reviews retrieved successfully",
  "data": [
    {
      "id": "review-uuid",
      "rating": 5,
      "comment": "Great experience!",
      "doctor": {
        "name": "Dr. John Smith",
        "specialty": "Cardiology"
      },
      "appointment": {
        "scheduleDate": "2026-02-01"
      },
      "createdAt": "2026-01-29T10:00:00Z",
      "isEditable": true,
      "editTimeRemaining": "6 days"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

##### FR-REVIEW-005: Delete Review

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As a patient/admin, I want to delete reviews so that I can remove inappropriate content. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-005.1 | System must soft-delete review | - Set isDeleted = true<br>- Preserve data for audit<br>- Exclude from public listings<br>- Update timestamp |
| FR-REVIEW-005.2 | System must recalculate doctor rating | - Recalculate average without deleted review<br>- Update review count<br>- Invalidate cache<br>- Real-time update |
| FR-REVIEW-005.3 | System must enforce authorization | - Patient can delete own review (within 7 days)<br>- Admin can delete any review (with reason)<br>- Log deletion with reason |
| FR-REVIEW-005.4 | System must send notifications | - Notify doctor of deletion<br>- Notify patient if admin deleted (with reason)<br>- Audit log entry |

###### Input (Admin only)

```ts
{
  reason: string (required for admin, max 500 chars)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {
    "id": "review-uuid",
    "isDeleted": true,
    "deletedAt": "2026-01-29T12:00:00Z"
  }
}
```

###### Error Scenarios

| Scenario | Response |
| --- | --- |
| Delete window expired (patient) |  HTTP 400 Bad Request |
| Review not found |  HTTP 404 Not Found |
| Unauthorized |  HTTP 403 Forbidden |

### 6.2 Review Analytics

##### FR-REVIEW-006: Get Review Statistics

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As an admin, I want to view review statistics so that I can monitor platform quality. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-006.1 | System must provide overall statistics | - Total reviews in system<br>- Reviews today/week/month<br>- Average platform rating<br>- Rating distribution |
| FR-REVIEW-006.2 | System must show trends | - Reviews over time (chart data)<br>- Average rating trends<br>- Growth rate<br>- Top-rated doctors |
| FR-REVIEW-006.3 | System must identify issues | - Low-rated appointments<br>- Flagged reviews (profanity, spam)<br>- Doctors needing attention (<3.5 rating) |
| FR-REVIEW-006.4 | System must enforce admin authorization | - Only SUPER_ADMIN and ADMIN access<br>- Return 403 for other roles |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Review statistics retrieved successfully",
  "data": {
    "overview": {
      "totalReviews": 5420,
      "todayReviews": 45,
      "weekReviews": 280,
      "monthReviews": 1250,
      "averageRating": 4.6
    },
    "ratingDistribution": {
      "5": 3200,
      "4": 1800,
      "3": 350,
      "2": 50,
      "1": 20
    },
    "trends": {
      "byMonth": [
        { "month": "2025-12", "count": 1100, "avgRating": 4.5 },
        { "month": "2026-01", "count": 1250, "avgRating": 4.6 }
      ]
    },
    "topRatedDoctors": [
      {
        "doctorId": "doctor-uuid",
        "doctorName": "Dr. John Smith",
        "averageRating": 4.9,
        "totalReviews": 150
      }
    ],
    "lowRatedDoctors": [
      {
        "doctorId": "doctor-uuid-2",
        "doctorName": "Dr. Jane Doe",
        "averageRating": 3.2,
        "totalReviews": 45,
        "needsAttention": true
      }
    ]
  }
}
```

##### FR-REVIEW-007: Doctor Response to Review

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As a doctor, I want to respond to patient reviews so that I can address concerns publicly. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-007.1 | System must store doctor response | - Add response field to Review<br>- Store response text and timestamp<br>- Link to review<br>- One response per review |
| FR-REVIEW-007.2 | System must validate response | - Response max 500 chars<br>- Sanitize input<br>- Professional tone check (optional AI)<br>- Cannot delete once posted |
| FR-REVIEW-007.3 | System must enforce authorization | - Only reviewed doctor can respond<br>- Cannot respond to deleted reviews<br>- Response within 30 days of review |
| FR-REVIEW-007.4 | System must notify patient | - Email patient when doctor responds<br>- Include response text<br>- Link to view full review |

###### Input Validation

```ts
{
  response: string (required, max 500 chars)
}
```

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Response added successfully",
  "data": {
    "reviewId": "review-uuid",
    "response": "Thank you for your feedback. I'm glad I could help!",
    "respondedAt": "2026-01-29T15:00:00Z"
  }
}
```

###### Business Rules (Review Module)

- Patients can review only COMPLETED appointments
- One review per appointment (no duplicates)
- Reviews must be submitted within 30 days of appointment completion
- Reviews editable for 7 days after submission
- Patients can delete own reviews within 7 days
- Admin can delete any review with valid reason (logged)
- Minimum 3-star average required for doctor profile visibility
- Doctors automatically hidden if rating drops below 2.5 (requires admin review)
- Review comments max 1000 characters
- Profanity filter applied to all comments
- Anonymous reviews not allowed (verified patients only)
- Doctor responses limited to 500 characters
- Reviews contribute to doctor search ranking
- Incentivize reviews: patients get 5% discount on next appointment if they review

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

##### NFR-PERF-001: Response Time

- ID
- Requirement
- Acceptance Criteria
- NFR-PERF-001.1
- API response time
- 95% of requests < 200ms
- 99% of requests < 500ms
- Database queries optimized
- Measured at server level
- NFR-PERF-001.2
- Database query performance
- Simple queries < 50ms
- Complex queries < 200ms
- Proper indexing on all foreign keys
- Query execution plans reviewed
- NFR-PERF-001.3
- File upload/download
- Upload: Support up to 10MB files
- Download: Serve via CDN
- Signed URLs for security
- Multipart upload for large files

##### NFR-PERF-002: Caching Strategy

- ID
- Requirement
- Acceptance Criteria
- NFR-PERF-002.1
- Redis caching implementation
- Cache frequently accessed data
- TTL: 15 min (doctor list, specialties)
- TTL: 5 min (schedules)
- TTL: 1 hour (static content)
- NFR-PERF-002.2
- Cache invalidation
- Invalidate on data update
- Invalidate on delete
- Tag-based invalidation
- Manual purge capability (admin)
- NFR-PERF-002.3
- Cache hit rate
- Target: >80% cache hit rate
- Monitor with Redis metrics
- Alert if drops below 70%

##### NFR-PERF-003: Scalability

- ID
- Requirement
- Acceptance Criteria
- NFR-PERF-003.1
- Concurrent users
- Support 10,000 concurrent users
- Horizontal scaling capability
- Load balancer ready
- Stateless API design
- NFR-PERF-003.2
- Database connection pooling
- Min pool size: 10
- Max pool size: 100
- Connection timeout: 30s
- Idle connection cleanup
- NFR-PERF-003.3
- Rate limiting
- 100 requests/minute per user
- 1000 requests/minute per IP
- Sliding window algorithm
- Return 429 when exceeded

### 7.2 Security Requirements

##### NFR-SEC-001: Authentication & Authorization

- ID
- Requirement
- Acceptance Criteria
- NFR-SEC-001.1
- Password security
- Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Bcrypt hashing (cost factor: 12)
- Password history (prevent reuse of last 5)
- Max failed attempts: 5 (lockout 30 min)
- NFR-SEC-001.2
- JWT token security
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Rotate refresh tokens
- Blacklist revoked tokens (Redis)
- NFR-SEC-001.3
- Session management
- Better Auth session handling
- Secure, HttpOnly cookies
- SameSite: Strict
- CSRF protection enabled

##### NFR-SEC-002: Data Protection

- ID
- Requirement
- Acceptance Criteria
- NFR-SEC-002.1
- Data encryption
- HTTPS/TLS 1.3 only
- Database encryption at rest
- Environment variables secured
- Secrets in AWS Secrets Manager
- NFR-SEC-002.2
- PII/PHI protection
- Encryption for sensitive fields
- Access logging for PHI
- Data anonymization for analytics
- NFR-SEC-002.3
- Input validation
- Zod schema validation
- SQL injection prevention (Prisma)
- XSS prevention (sanitization)
- File upload validation (type, size)

##### NFR-SEC-003: API Security

- ID
- Requirement
- Acceptance Criteria
- NFR-SEC-003.1
- CORS configuration
- Whitelist allowed origins
- Credentials support enabled
- Preflight caching
- Environment-specific origins
- NFR-SEC-003.2
- API rate limiting
- Per-user rate limits
- Per-IP rate limits
- DDoS protection
- Cloudflare integration
- NFR-SEC-003.3
- Security headers
- Helmet.js middleware
- Content Security Policy
- X-Frame-Options: DENY
- HSTS enabled

### 7.3 Reliability & Availability

##### NFR-REL-001: Uptime

- ID
- Requirement
- Acceptance Criteria
- NFR-REL-001.1
- Service availability
- 99.9% uptime SLA
- Maximum 43 minutes downtime/month
- Scheduled maintenance windows
- Blue-green deployment
- NFR-REL-001.2
- Database availability
- PostgreSQL replication (master-slave)
- Automatic failover
- Point-in-time recovery
- Daily backups retained 30 days
- NFR-REL-001.3
- Redis availability
- Redis Cluster or Sentinel
- Automatic failover
- Persistence enabled (AOF + RDB)
- Backup daily

##### NFR-REL-002: Error Handling

- ID
- Requirement
- Acceptance Criteria
- NFR-REL-002.1
- Global error handling
- Centralized error middleware
- Proper HTTP status codes
- User-friendly error messages
- Never expose stack traces
- NFR-REL-002.2
- Transaction management
- Atomic operations with Prisma
- Rollback on failure
- Retry logic for transient failures
- Idempotency for critical operations
- NFR-REL-002.3
- Circuit breaker
- Implement for external services (Stripe, email)
- Open after 5 consecutive failures
- Half-open after 30 seconds
- Fallback mechanisms

##### NFR-REL-003: Monitoring & Logging

- ID
- Requirement
- Acceptance Criteria
- NFR-REL-003.1
- Application logging
- Winston for structured logging
- Log levels: error, warn, info, debug
- Rotate logs daily
- Retention: 90 days
- NFR-REL-003.2
- Error tracking
- Sentry integration
- Real-time error alerts
- Stack trace capture
- User context included
- NFR-REL-003.3
- Performance monitoring
- APM tool (e.g., New Relic, DataDog)
- Response time metrics
- Database query monitoring
- Memory/CPU usage tracking
- NFR-REL-003.4
- Audit logging
- Log all CRUD operations
- Log authentication events
- Log admin actions
- Log payment transactions
- Immutable audit trail

### 7.4 Maintainability

##### NFR-MAIN-001: Code Quality

- ID
- Requirement
- Acceptance Criteria
- NFR-MAIN-001.1
- Code standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Pre-commit hooks (Husky)
- NFR-MAIN-001.2
- Code documentation
- JSDoc comments for public APIs
- README files for modules
- API documentation (Swagger/OpenAPI)
- Architecture diagrams
- NFR-MAIN-001.3
- Code complexity
- Max cyclomatic complexity: 10
- Max function length: 50 lines
- Max file length: 300 lines
- SonarQube analysis

##### NFR-MAIN-002: Testing

- ID
- Requirement
- Acceptance Criteria
- NFR-MAIN-002.1
- Unit testing
- Jest framework
- Coverage: >80%
- Test all services/utilities
- Mock external dependencies
- NFR-MAIN-002.2
- Integration testing
- Test API endpoints
- Test database interactions
- Test authentication flows
- Coverage: >70%
- NFR-MAIN-002.3
- E2E testing
- Test critical user flows
- Appointment booking flow
- Payment flow
- Authentication flow

##### NFR-MAIN-003: Deployment

- ID
- Requirement
- Acceptance Criteria
- NFR-MAIN-003.1
- CI/CD pipeline
- GitHub Actions workflow
- Automated testing on PR
- Automated deployment to staging
- Manual approval for production
- NFR-MAIN-003.2
- Environment management
- Separate: dev, staging, production
- Environment-specific configs
- Secrets management
- Database migration automation
- NFR-MAIN-003.3
- Rollback capability
- Keep last 5 deployments
- One-click rollback
- Database migration rollback scripts
- Health check before traffic routing

### 7.5 Usability

##### NFR-USE-001: API Design

- ID
- Requirement
- Acceptance Criteria
- NFR-USE-001.1
- RESTful conventions
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs
- Proper status codes
- Consistent naming (camelCase)
- NFR-USE-001.2
- Response format
- Consistent JSON structure
- Success: {success, message, data}
- Error: {success, message, error}
- Pagination: {data, meta}
- NFR-USE-001.3
- API versioning
- URL versioning (/api/v1/)
- Deprecation notices
- 6-month deprecation period
- Changelog maintained

##### NFR-USE-002: Documentation

- ID
- Requirement
- Acceptance Criteria
- NFR-USE-002.1
- API documentation
- OpenAPI 3.0 specification
- Swagger UI available
- Request/response examples
- Authentication instructions
- NFR-USE-002.2
- Developer documentation
- Setup instructions
- Environment configuration
- Database schema documentation
- Troubleshooting guide

### 7.6 Compliance

##### NFR-COMP-001: Healthcare Compliance

- ID
- Requirement
- Acceptance Criteria
- NFR-COMP-001.1
- Data Security
- PHI encryption at rest and in transit
- Access controls and audit logs
- Business Associate Agreements (BAAs)
- Regular compliance audits
- NFR-COMP-001.2
- Data retention
- Medical records: 7 years
- Payment records: indefinite
- Prescription records: 7 years
- Audit logs: 7 years
- NFR-COMP-001.3
- Patient rights
- Data access (patient can download data)
- Data deletion (right to be forgotten)
- Data portability (export to JSON/PDF)
- Privacy policy acceptance

##### NFR-COMP-002: Payment Compliance

- ID
- Requirement
- Acceptance Criteria
- NFR-COMP-002.1
- PCI DSS compliance
- Never store card details
- Stripe handles payment data
- Tokenization for payment methods
- Annual PCI audit
- NFR-COMP-002.2
- Financial regulations
- Invoice generation
- Tax calculations (if applicable)
- Refund processing
- Transaction records

## 8. Technical Implementation Details

### 8.1 Technology Stack

#### Backend Framework

- Runtime: Node.js 20.x LTS
- Framework: Express.js (latest)
- Language: TypeScript 5.x
- Package Manager: pnpm

#### Database & ORM

- Database: PostgreSQL 16.x
- ORM: Prisma 7.x (multi-file schema)
- Schema Files:
-   - base.prisma (User, AuthUser, AuthSession, etc.)
-   - admin.prisma (Admin model)
-   - doctor.prisma (Doctor model)
-   - patient.prisma (Patient, PatientHealthData)
-   - specialty.prisma (Specialty, DoctorSpecialty)
-   - schedule.prisma (Schedule, DoctorSchedule)
-   - appointment.prisma (Appointment model)
-   - payment.prisma (Payment model)
-   - prescription.prisma (Prescription model)
-   - review.prisma (Review model)
-   - medical-report.prisma (MedicalReport model)

#### Caching & Session

- Cache: Redis (latest)
- Session: Better Auth with Redis store
- Cache Strategy: Write-through, Cache-aside

#### Authentication

- Auth Library: Better Auth
- Strategy: Session-based + JWT
- Providers: Email/Password
- Features: Email verification, password reset

#### Payment Processing

- Payment Gateway: Stripe
- API Version: 2023-10-16+
- Features: Payment Intent, Webhooks, Refunds

#### File Storage

- Storage: AWS S3 (or compatible)
- Use Cases: Profile photos, medical reports, prescriptions
- Access: Signed URLs with expiry

#### Email Service

- Provider: Nodemailer with SMTP
- Templates: Handlebars/EJS
- Use Cases: Verification, notifications, prescriptions

#### Logging

- Logger: Winston
- Transports: Console, File, Cloud (optional)
- Levels: error, warn, info, debug
- Format: JSON structured logging

#### Validation

- Schema Validation: Zod
- Input Sanitization: express-validator
- File Validation: Custom middleware

### 8.2 Project Structure

```text
Backend-My-PH-HealthCare/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   ├── database.ts           # Prisma client
│   │   ├── redis.ts              # Redis client
│   │   ├── auth.ts               # Better Auth config
│   │   ├── stripe.ts             # Stripe config
│   │   └── logger.ts             # Winston config
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── admin/
│   │   ├── doctor/
│   │   ├── patient/
│   │   ├── specialty/
│   │   ├── schedule/
│   │   ├── appointment/
│   │   ├── payment/
│   │   ├── prescription/
│   │   └── review/
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── rbac.middleware.ts    # Role-based access
│   │   ├── error.middleware.ts   # Global error handler
│   │   ├── validate.middleware.ts # Zod validation
│   │   └── rateLimit.middleware.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── pagination.ts
│   │   └── fileUpload.ts
│   ├── types/
│   │   ├── express.d.ts          # Express type extensions
│   │   └── index.ts
│   └── constants/
│       ├── roles.ts
│       ├── httpStatus.ts
│       └── index.ts
├── prisma/
│   ├── schema/                   # Multi-file schema
│   │   ├── base.prisma
│   │   ├── admin.prisma
│   │   ├── doctor.prisma
│   │   ├── patient.prisma
│   │   ├── specialty.prisma
│   │   ├── schedule.prisma
│   │   ├── appointment.prisma
│   │   ├── payment.prisma
│   │   ├── prescription.prisma
│   │   ├── review.prisma
│   │   └── medical-report.prisma
│   └── seed.ts                   # Database seeding
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                         # Documentation
├── uploads/                      # Temporary file uploads
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
└── README.md
```

### 8.3 Database Design Principles

#### Soft Delete Pattern

- All models have isDeleted field
- Never permanently delete data
- Filter soft-deleted records in queries
- Admin can restore deleted records

#### Denormalization Strategy

- Store frequently accessed data (doctor fee, patient name)
- Reduce joins for better performance
- Update denormalized data on source update
- Trade-off: Storage vs Performance

#### Junction Tables

- DoctorSpecialty: Many-to-many (Doctor ↔︎ Specialty)
- DoctorSchedule: Many-to-many (Doctor ↔︎ Schedule)
- Composite keys for uniqueness

#### Enum Usage

- UserRole, UserStatus, Gender, BloodGroup
- AppointmentStatus, PaymentStatus
- MaritalStatus, ReportType
- Database-level constraints

#### Timestamp Tracking

- createdAt, updatedAt (automatic)
- Custom timestamps for specific events
- Audit trail for compliance

### 8.4 API Response Standards

###### Success Response Format

```ts
{
  success: true,
  message: string,
  data: T | T[] | null,
  meta?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

###### Error Response Format

```ts
{
  success: false,
  message: string,
  error?: {
    code: string,
    details?: any
  },
  statusCode: number
}
```

###### HTTP Status Codes Used

| Item | Description |
| --- | --- |
| 200 |  OK (Success) |
| 201 |  Created (Resource created) |
| 204 |  No Content (Delete success) |
| 400 |  Bad Request (Validation error) |
| 401 |  Unauthorized (Not authenticated) |
| 403 |  Forbidden (Not authorized) |
| 404 |  Not Found (Resource not found) |
| 409 |  Conflict (Duplicate, constraint violation) |
| 413 |  Payload Too Large (File too large) |
| 422 |  Unprocessable Entity (Business logic error) |
| 429 |  Too Many Requests (Rate limit exceeded) |
| 500 |  Internal Server Error (Server error) |
| 503 |  Service Unavailable (Maintenance, overload) |
