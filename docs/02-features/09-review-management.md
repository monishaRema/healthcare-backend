# Review Management

- [Docs Home](../../README.md)
- [Feature Index](./README.md)

## 6. Review Management Module

### 6.1 Review Operations

##### FR-REVIEW-001: Create Review

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a patient, I want to review my doctor after appointment so that I can share my experience. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-001.1 | System must create review | - Link to appointment (appointmentId)<br>- Accept rating (1-5) and comment<br>- Generate unique review ID<br>- Store in Review table |
| FR-REVIEW-001.2 | System must validate review constraints | - Appointment must be COMPLETED<br>- Patient must be appointment’s patient<br>- One review per appointment<br>- Rating: integer 1-5 |
| FR-REVIEW-001.3 | System must validate review content | - Rating required (1-5 stars)<br>- Comment optional (max 1000 chars)<br>- Comment sanitized (XSS prevention)<br>- Profanity filter applied |
| FR-REVIEW-001.4 | System must update doctor statistics | - Recalculate average rating<br>- Update total review count<br>- Update doctor profile cache<br>- Real-time rating update |
| FR-REVIEW-001.5 | System must enforce authorization | - Only appointment patient can review<br>- Can review within 30 days of completion<br>- Return 403 for unauthorized |
| FR-REVIEW-001.6 | System must send notifications | - Email notification to doctor<br>- Include rating and comment<br>- Option for doctor to respond |

###### Input Validation

```ts
{
  appointmentId: string (required, valid UUID),
  rating: number (required, integer, 1-5),
  comment: string (optional, max 1000 chars)
}
```

##### FR-REVIEW-002: Update Review

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As a patient, I want to edit my review so that I can correct or update my feedback. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-002.1 | System must update review | - Update rating and/or comment<br>- Partial update supported<br>- Preserve other fields<br>- Update timestamp |
| FR-REVIEW-002.2 | System must validate update constraints | - Can update within 7 days of creation<br>- Rating validation if changed<br>- Comment validation if changed |
| FR-REVIEW-002.3 | System must recalculate doctor rating | - Update doctor average rating<br>- Invalidate doctor cache<br>- Real-time update |
| FR-REVIEW-002.4 | System must enforce authorization | - Only review author can update<br>- Within edit time window (7 days)<br>- Admin cannot edit patient reviews |

###### Input Validation (All fields optional)

```ts
{
  rating: number (optional, integer, 1-5),
  comment: string (optional, max 1000 chars)
}
```

##### FR-REVIEW-003: Get Doctor Reviews

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a user, I want to view doctor reviews so that I can choose the right doctor. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-003.1 | System must return doctor reviews | - Filter by doctor ID<br>- Include patient name (anonymized option)<br>- Include rating and comment<br>- Include date |
| FR-REVIEW-003.2 | System must support pagination | - Default: page=1, limit=10<br>- Sort by rating (high/low)<br>- Sort by date (newest/oldest)<br>- Include total count |
| FR-REVIEW-003.3 | System must support filtering | - Filter by rating (e.g., 5-star only)<br>- Filter by date range<br>- Verified reviews only option |
| FR-REVIEW-003.4 | System must include summary statistics | - Average rating<br>- Total reviews<br>- Rating distribution (1-5 stars)<br>- Percentage breakdown |
| FR-REVIEW-003.5 | System must implement anonymization | - Option to hide patient full name<br>- Show only first name + initial<br>- Configurable per patient |
| FR-REVIEW-003.6 | System must be public | - No authentication required<br>- Publicly accessible endpoint<br>- Cache for performance (TTL: 15 min) |

###### Query Parameters

```ts
{
  doctorId: string (required),
  page: number (default: 1),
  limit: number (default: 10, max: 50),
  rating: number (optional, filter by specific rating),
  sortBy: 'rating' | 'createdAt' (default: 'createdAt'),
  sortOrder: 'asc' | 'desc' (default: 'desc')
}
```

##### FR-REVIEW-004: Get Patient Reviews

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As a patient, I want to view my submitted reviews so that I can track my feedback history. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-004.1 | System must return patient reviews | - Filter by patient ID<br>- Include doctor details<br>- Include appointment details<br>- Show edit status |
| FR-REVIEW-004.2 | System must support pagination | - Default: page=1, limit=10<br>- Sort by creation date DESC<br>- Include total count |
| FR-REVIEW-004.3 | System must indicate editability | - Flag if still editable (within 7 days)<br>- Show time remaining for edit<br>- Show last updated timestamp |
| FR-REVIEW-004.4 | System must enforce authorization | - Patient can view own reviews only<br>- Admin can view all reviews |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Patient reviews retrieved successfully",
  "data": [
    {
      "id": "review-uuid",
      "rating": 5,
      "comment": "Great experience!",
      "doctor": {
        "name": "Dr. John Smith",
        "specialty": "Cardiology"
      },
      "appointment": {
        "scheduleDate": "2026-02-01"
      },
      "createdAt": "2026-01-29T10:00:00Z",
      "isEditable": true,
      "editTimeRemaining": "6 days"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

##### FR-REVIEW-005: Delete Review

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As a patient/admin, I want to delete reviews so that I can remove inappropriate content. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-005.1 | System must soft-delete review | - Set isDeleted = true<br>- Preserve data for audit<br>- Exclude from public listings<br>- Update timestamp |
| FR-REVIEW-005.2 | System must recalculate doctor rating | - Recalculate average without deleted review<br>- Update review count<br>- Invalidate cache<br>- Real-time update |
| FR-REVIEW-005.3 | System must enforce authorization | - Patient can delete own review (within 7 days)<br>- Admin can delete any review (with reason)<br>- Log deletion with reason |
| FR-REVIEW-005.4 | System must send notifications | - Notify doctor of deletion<br>- Notify patient if admin deleted (with reason)<br>- Audit log entry |

###### Input (Admin only)

```ts
{
  reason: string (required for admin, max 500 chars)
}
```

### 6.2 Review Analytics

##### FR-REVIEW-006: Get Review Statistics

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As an admin, I want to view review statistics so that I can monitor platform quality. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-006.1 | System must provide overall statistics | - Total reviews in system<br>- Reviews today/week/month<br>- Average platform rating<br>- Rating distribution |
| FR-REVIEW-006.2 | System must show trends | - Reviews over time (chart data)<br>- Average rating trends<br>- Growth rate<br>- Top-rated doctors |
| FR-REVIEW-006.3 | System must identify issues | - Low-rated appointments<br>- Flagged reviews (profanity, spam)<br>- Doctors needing attention (<3.5 rating) |
| FR-REVIEW-006.4 | System must enforce admin authorization | - Only SUPER_ADMIN and ADMIN access<br>- Return 403 for other roles |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Review statistics retrieved successfully",
  "data": {
    "overview": {
      "totalReviews": 5420,
      "todayReviews": 45,
      "weekReviews": 280,
      "monthReviews": 1250,
      "averageRating": 4.6
    },
    "ratingDistribution": {
      "5": 3200,
      "4": 1800,
      "3": 350,
      "2": 50,
      "1": 20
    },
    "trends": {
      "byMonth": [
        { "month": "2025-12", "count": 1100, "avgRating": 4.5 },
        { "month": "2026-01", "count": 1250, "avgRating": 4.6 }
      ]
    },
    "topRatedDoctors": [
      {
        "doctorId": "doctor-uuid",
        "doctorName": "Dr. John Smith",
        "averageRating": 4.9,
        "totalReviews": 150
      }
    ],
    "lowRatedDoctors": [
      {
        "doctorId": "doctor-uuid-2",
        "doctorName": "Dr. Jane Doe",
        "averageRating": 3.2,
        "totalReviews": 45,
        "needsAttention": true
      }
    ]
  }
}
```

##### FR-REVIEW-007: Doctor Response to Review

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As a doctor, I want to respond to patient reviews so that I can address concerns publicly. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-REVIEW-007.1 | System must store doctor response | - Add response field to Review<br>- Store response text and timestamp<br>- Link to review<br>- One response per review |
| FR-REVIEW-007.2 | System must validate response | - Response max 500 chars<br>- Sanitize input<br>- Professional tone check (optional AI)<br>- Cannot delete once posted |
| FR-REVIEW-007.3 | System must enforce authorization | - Only reviewed doctor can respond<br>- Cannot respond to deleted reviews<br>- Response within 30 days of review |
| FR-REVIEW-007.4 | System must notify patient | - Email patient when doctor responds<br>- Include response text<br>- Link to view full review |

###### Input Validation

```ts
{
  response: string (required, max 500 chars)
}
```
