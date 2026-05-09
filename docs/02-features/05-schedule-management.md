# Schedule Management

- [Docs Home](../../README.md)
- [Feature Index](./README.md)

### 2.5 Schedule Management

##### FR-SCHEDULE-001: Create Doctor Schedule

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a doctor, I want to create my availability schedule so that patients can book appointments. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-001.1 | System must create schedule | - Accept date, start time, end time<br>- Link to doctor via DoctorSchedule junction<br>- Generate unique schedule ID<br>- Store in Schedule table |
| FR-SCHEDULE-001.2 | System must validate schedule data | - Date: future or today<br>- Start time: HH:mm format<br>- End time: after start time<br>- Duration: min 30 min, max 12 hours |
| FR-SCHEDULE-001.3 | System must prevent overlaps | - Check existing schedules for doctor<br>- No time overlap allowed<br>- Same date conflict detection<br>- Return 409 if overlap found |
| FR-SCHEDULE-001.4 | System must enforce authorization | - Doctor can create own schedule<br>- Admin can create for any doctor<br>- Return 403 for unauthorized access |
| FR-SCHEDULE-001.5 | System must handle bulk creation | - Support creating multiple time slots<br>- Atomic transaction (all or nothing)<br>- Rollback on any failure |

###### Input Validation

```ts
{
  scheduleDate: string (required, ISO date, today or future),
  startTime: string (required, HH:mm format),
  endTime: string (required, HH:mm format, after startTime)
}
```

##### FR-SCHEDULE-002: Get Doctor Schedule

| Field | Value |
| --- | --- |
| Priority | HIGH |
| User Story | As a patient, I want to view doctor availability so that I can book an appointment. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-002.1 | System must return doctor schedules | - Filter by doctor ID<br>- Filter by date range<br>- Show only available (not booked) slots<br>- Sort by date and time ascending |
| FR-SCHEDULE-002.2 | System must support date filtering | - Filter by specific date<br>- Filter by date range (start/end)<br>- Default: next 7 days<br>- Exclude past dates |
| FR-SCHEDULE-002.3 | System must show booking status | - isBooked flag for each slot<br>- Hide fully booked slots by default<br>- Option to show all (for doctor/admin) |
| FR-SCHEDULE-002.4 | System must implement caching | - Cache schedules per doctor (TTL: 5 min)<br>- Invalidate on schedule changes<br>- Invalidate on booking |
| FR-SCHEDULE-002.5 | System must include doctor info | - Include doctor name, specialty<br>- Include appointment fee<br>- Public endpoint (no auth for viewing) |

###### Query Parameters

```ts
{
  doctorId: string (required),
  startDate: string (optional, ISO date, default: today),
  endDate: string (optional, ISO date, default: today + 7 days),
  showBooked: boolean (optional, default: false)
}
```

##### FR-SCHEDULE-003: Update Doctor Schedule

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a doctor, I want to modify my schedule so that I can adjust my availability. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-003.1 | System must update schedule | - Update date, start time, or end time<br>- Partial update supported<br>- Preserve other fields |
| FR-SCHEDULE-003.2 | System must validate constraints | - Cannot update if already booked<br>- Must maintain time logic (end > start)<br>- No overlap with other schedules |
| FR-SCHEDULE-003.3 | System must enforce authorization | - Doctor can update own schedule<br>- Admin can update any schedule<br>- Return 403 for unauthorized |
| FR-SCHEDULE-003.4 | System must invalidate cache | - Clear doctor schedule cache<br>- Clear appointment cache if linked<br>- Update in real-time |

###### Input Validation (All fields optional)

```ts
{
  scheduleDate: string (optional, ISO date, today or future),
  startTime: string (optional, HH:mm format),
  endTime: string (optional, HH:mm format, after startTime)
}
```

##### FR-SCHEDULE-004: Delete Doctor Schedule

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a doctor, I want to delete my schedule slots so that I can remove unavailable times. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SCHEDULE-004.1 | System must soft-delete schedule | - Set isDeleted = true<br>- Cannot delete if booked<br>- Preserve for audit trail |
| FR-SCHEDULE-004.2 | System must check booking status | - Return 409 if schedule has appointment<br>- Must cancel appointment first<br>- Clear error message |
| FR-SCHEDULE-004.3 | System must enforce authorization | - Doctor can delete own schedule<br>- Admin can delete any schedule<br>- Return 403 for unauthorized |
| FR-SCHEDULE-004.4 | System must invalidate cache | - Clear doctor schedule cache<br>- Update availability count<br>- Real-time update |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Schedule deleted successfully",
  "data": {
    "id": "schedule-uuid",
    "isDeleted": true
  }
}
```
