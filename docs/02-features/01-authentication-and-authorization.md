# Authentication and Authorization

- [Docs Home](../../README.md)
- [Feature Index](./README.md)

### 2.1 Authentication & Authorization Module

#### 2.1.1 User Registration

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

- Subject: “Verify Your HealthCare Account”
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

- Subject: “Reset Your HealthCare Password”
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
