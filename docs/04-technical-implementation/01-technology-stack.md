# Technology Stack

- [Docs Home](../README.md)
- [Technical Implementation Index](./README.md)

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
- base.prisma (User, AuthUser, AuthSession, etc.)
- admin.prisma (Admin model)
- doctor.prisma (Doctor model)
- patient.prisma (Patient, PatientHealthData)
- specialty.prisma (Specialty, DoctorSpecialty)
- schedule.prisma (Schedule, DoctorSchedule)
- appointment.prisma (Appointment model)
- payment.prisma (Payment model)
- prescription.prisma (Prescription model)
- review.prisma (Review model)
- medical-report.prisma (MedicalReport model)

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
