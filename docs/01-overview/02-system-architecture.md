# System Architecture Overview

- [Docs Home](../../README.md)
- [Overview Index](./README.md)
- [Technical Implementation](../04-technical-implementation/README.md)

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
| Architecture Pattern | Layered Architecture (Controller → Service → Repository) |
| API Design | RESTful with JSON payload |
| Authentication | Token-based (JWT) with session management |
| Data Model | Relational with soft-delete pattern |
| Caching Strategy | Redis for frequently accessed data |
| File Storage | Cloud storage (AWS S3) for medical documents |
| Deployment | Cloud-native, containerizable |
