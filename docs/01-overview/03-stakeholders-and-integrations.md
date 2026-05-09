# Stakeholders and Integrations

- [Docs Home](../../README.md)
- [Overview Index](./README.md)
- [ERD](./04-entity-relationship-diagram.md)

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
