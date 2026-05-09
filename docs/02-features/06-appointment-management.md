# Appointment Management

- [Docs Home](../../README.md)
- [Feature Index](./README.md)

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
