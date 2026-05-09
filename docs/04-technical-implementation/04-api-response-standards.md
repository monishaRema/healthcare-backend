# API Response Standards

- [Docs Home](../README.md)
- [Technical Implementation Index](./README.md)

### 8.4 API Response Standards

Unless otherwise stated in an individual requirement, API endpoints should follow the response envelopes and status code conventions defined in this section.

#### Success Response Format

```ts
{
  success: true,
  message: string,
  data: T | T[] | null,
  meta?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### Error Response Format

```ts
{
  success: false,
  message: string,
  error?: {
    code: string,
    details?: any
  },
  statusCode: number
}
```

#### HTTP Status Codes Used

| Status Code | Meaning |
| --- | --- |
| 200 | OK (Success) |
| 201 | Created (Resource created) |
| 204 | No Content (Delete success) |
| 400 | Bad Request (Validation error) |
| 401 | Unauthorized (Not authenticated) |
| 403 | Forbidden (Not authorized) |
| 404 | Not Found (Resource not found) |
| 409 | Conflict (Duplicate, constraint violation) |
| 413 | Payload Too Large (File too large) |
| 422 | Unprocessable Entity (Business logic error) |
| 429 | Too Many Requests (Rate limit exceeded) |
| 500 | Internal Server Error (Server error) |
| 503 | Service Unavailable (Maintenance, overload) |
