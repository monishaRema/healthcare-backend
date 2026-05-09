# Specialty Management

- [Docs Home](../../README.md)
- [Feature Index](./README.md)

### 2.4 Specialty Management

##### FR-SPECIALTY-001: Create Specialty

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As an admin, I want to create medical specialties so that doctors can be categorized by their expertise. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-001.1 | System must create specialty | - Accept title and icon (optional)<br>- Generate unique ID<br>- Store in Specialty table<br>- Return created specialty |
| FR-SPECIALTY-001.2 | System must validate specialty data | - Title required (2-100 chars)<br>- Title must be unique (case-insensitive)<br>- Icon optional (valid URL or emoji)<br>- Sanitize inputs |
| FR-SPECIALTY-001.3 | System must enforce authorization | - Only SUPER_ADMIN and ADMIN can create<br>- Return 403 for other roles |
| FR-SPECIALTY-001.4 | System must handle duplicates | - Check existing specialty by title<br>- Return 409 if duplicate found<br>- Case-insensitive comparison |

###### Input Validation

```ts
{
  title: string (required, 2-100 chars, unique),
  icon: string (optional, max 500 chars)
}
```

##### FR-SPECIALTY-002: Update Specialty

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As an admin, I want to update specialty information so that specialty details remain accurate. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-002.1 | System must update specialty | - Accept specialty ID and update data<br>- Update title and/or icon<br>- Partial update supported<br>- Return updated specialty |
| FR-SPECIALTY-002.2 | System must validate update data | - Title validation if provided (2-100 chars)<br>- Title uniqueness check (exclude self)<br>- Icon validation if provided |
| FR-SPECIALTY-002.3 | System must enforce authorization | - Only SUPER_ADMIN and ADMIN can update<br>- Return 403 for other roles |
| FR-SPECIALTY-002.4 | System must validate specialty exists | - Return 404 if specialty not found<br>- Check soft-deleted status |

###### Input Validation (All fields optional)

```ts
{
  title: string (optional, 2-100 chars, unique),
  icon: string (optional, max 500 chars)
}
```

##### FR-SPECIALTY-003: Get Specialty List

| Field | Value |
| --- | --- |
| Priority | MEDIUM |
| User Story | As a user, I want to view all medical specialties so that I can find doctors by specialty. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-003.1 | System must return all specialties | - List all active specialties<br>- Exclude soft-deleted<br>- No authentication required (public endpoint) |
| FR-SPECIALTY-003.2 | System must include doctor count | - Count active doctors per specialty<br>- Use DoctorSpecialty junction table<br>- Exclude deleted doctors |
| FR-SPECIALTY-003.3 | System must support pagination | - Default: page=1, limit=20<br>- Support page and limit params<br>- Return total count |
| FR-SPECIALTY-003.4 | System must support search | - Search by specialty title<br>- Case-insensitive search<br>- Partial match support |
| FR-SPECIALTY-003.5 | System must implement caching | - Cache specialty list (TTL: 1 hour)<br>- Invalidate on create/update/delete<br>- Reduce database load |

###### Query Parameters

```ts
{
  page: number (default: 1, min: 1),
  limit: number (default: 20, max: 100),
  searchTerm: string (optional, search title)
}
```

##### FR-SPECIALTY-004: Delete Specialty

| Field | Value |
| --- | --- |
| Priority | LOW |
| User Story | As an admin, I want to soft-delete unused specialties so that specialty list remains relevant. |

###### Requirements

| ID | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR-SPECIALTY-004.1 | System must soft-delete specialty | - Set isDeleted = true<br>- Preserve data (not permanent delete)<br>- Update timestamp |
| FR-SPECIALTY-004.2 | System must check dependencies | - Cannot delete if doctors assigned<br>- Must reassign doctors first<br>- Return appropriate error |
| FR-SPECIALTY-004.3 | System must enforce authorization | - Only SUPER_ADMIN can delete<br>- Return 403 for other roles |
| FR-SPECIALTY-004.4 | System must invalidate cache | - Clear specialty cache<br>- Clear doctor cache (affected doctors)<br>- Ensure consistency |

###### Success Response

**Status:** HTTP 200 OK

```json
{
  "success": true,
  "message": "Specialty deleted successfully",
  "data": {
    "id": "specialty-uuid",
    "title": "Cardiology",
    "isDeleted": true
  }
}
```
