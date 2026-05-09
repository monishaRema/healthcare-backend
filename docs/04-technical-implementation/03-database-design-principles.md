# Database Design Principles

- [Docs Home](../README.md)
- [Technical Implementation Index](./README.md)

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
