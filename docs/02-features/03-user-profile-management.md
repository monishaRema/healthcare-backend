# User Profile Management

- [Docs Home](../../README.md)
- [Feature Index](./README.md)

### 2.3 User Profile Management

#### 2.3.1 Admin Management

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

#### 2.3.2 Doctor Management

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

#### 2.3.3 Patient Management

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
