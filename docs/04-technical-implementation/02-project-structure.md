# Project Structure

- [Docs Home](../README.md)
- [Technical Implementation Index](./README.md)

### 8.2 Project Structure

```text
Backend-My-PH-HealthCare/
├── src/
│ ├── app.ts # Express app setup
│ ├── server.ts # Server entry point
│ ├── config/
│ │ ├── database.ts # Prisma client
│ │ ├── redis.ts # Redis client
│ │ ├── auth.ts # Better Auth config
│ │ ├── stripe.ts # Stripe config
│ │ └── logger.ts # Winston config
│ ├── modules/
│ │ ├── auth/
│ │ │ ├── auth.controller.ts
│ │ │ ├── auth.service.ts
│ │ │ ├── auth.routes.ts
│ │ │ └── auth.validation.ts
│ │ ├── admin/
│ │ ├── doctor/
│ │ ├── patient/
│ │ ├── specialty/
│ │ ├── schedule/
│ │ ├── appointment/
│ │ ├── payment/
│ │ ├── prescription/
│ │ └── review/
│ ├── middlewares/
│ │ ├── auth.middleware.ts # JWT verification
│ │ ├── rbac.middleware.ts # Role-based access
│ │ ├── error.middleware.ts # Global error handler
│ │ ├── validate.middleware.ts # Zod validation
│ │ └── rateLimit.middleware.ts
│ ├── utils/
│ │ ├── ApiError.ts
│ │ ├── ApiResponse.ts
│ │ ├── asyncHandler.ts
│ │ ├── pagination.ts
│ │ └── fileUpload.ts
│ ├── types/
│ │ ├── express.d.ts # Express type extensions
│ │ └── index.ts
│ └── constants/
│ ├── roles.ts
│ ├── httpStatus.ts
│ └── index.ts
├── prisma/
│ ├── schema/ # Multi-file schema
│ │ ├── base.prisma
│ │ ├── admin.prisma
│ │ ├── doctor.prisma
│ │ ├── patient.prisma
│ │ ├── specialty.prisma
│ │ ├── schedule.prisma
│ │ ├── appointment.prisma
│ │ ├── payment.prisma
│ │ ├── prescription.prisma
│ │ ├── review.prisma
│ │ └── medical-report.prisma
│ └── seed.ts # Database seeding
├── tests/
│ ├── unit/
│ ├── integration/
│ └── e2e/
├── docs/ # Documentation
├── uploads/ # Temporary file uploads
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
└── README.md
```
