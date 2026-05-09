# Prescription Management

- [Docs Home](../../README.md)
- [Feature Index](./README.md)

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
