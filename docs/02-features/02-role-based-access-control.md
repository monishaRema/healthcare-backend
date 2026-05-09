# Role-Based Access Control

- [Docs Home](../../README.md)
- [Feature Index](./README.md)

### 2.2 Role-Based Access Control (RBAC)

#### 2.2.1 Role Definition & Hierarchy

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
| Manage Admins | Yes | No | No | No |
| Manage Doctors | Yes | Yes | No | No |
| Manage Patients | Yes | Yes | No | No |
| Manage Specialties | Yes | Yes | No | No |
| View All Appointments | Yes | Yes | No | No |
| Manage Own Schedule | No | No | Yes | No |
| View Own Appointments | No | No | Yes | Yes |
| Book Appointments | No | No | No | Yes |
| Write Prescriptions | No | No | Yes | No |
| View Prescriptions | No | No | Yes (own) | Yes (own) |
| Submit Reviews | No | No | No | Yes |
| Upload Medical Reports | No | No | No | Yes |
| View Patient Health Data | No | No | Yes (assigned) | Yes (own) |
| System Logs | Yes | Yes | No | No |

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
