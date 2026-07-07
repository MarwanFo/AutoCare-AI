# AutoCare AI — REST API Design Standards

This document establishes the mandatory conventions and guidelines for designing, documenting, and implementing RESTful APIs for the AutoCare AI application.

---

## 1. REST Conventions & HTTP Methods

Use HTTP methods strictly according to their semantic purpose:

*   **`GET`**: Retrieve resources. Safe and idempotent. Must not alter database state.
*   **`POST`**: Create new resources or execute stateful actions (e.g. login, invoice scans). Non-idempotent.
*   **`PUT`**: Replace an existing resource entirely. Idempotent.
*   **`PATCH`**: Apply partial modifications to a resource. Non-idempotent.
*   **`DELETE`**: Remove a resource. Idempotent.

---

## 2. URL Naming Conventions

*   **Plural Nouns**: Resource paths must use plural nouns (e.g., `/api/v1/vehicles`, not `/api/v1/vehicle`).
*   **Lowercase & Kebab-case**: Use lowercase words separated by hyphens for endpoints (e.g. `/api/v1/maintenance-logs`).
*   **Resource Hierarchies**: Express sub-resources using nested URI paths:
    *   `GET /api/v1/vehicles/{id}/maintenance` (Retrieve maintenance logs for a specific vehicle).
    *   `POST /api/v1/vehicles/{id}/maintenance` (Log a new maintenance event for a specific vehicle).

---

## 3. HTTP Status Codes

Every API response must return the appropriate standard HTTP status code:

| Code | Status | Usage Scenario |
| :--- | :--- | :--- |
| **`200`** | `OK` | Successful `GET`, `PUT`, or `PATCH` request. |
| **`201`** | `Created` | Successful `POST` request resulting in resource creation. |
| **`202`** | `Accepted` | Request accepted for asynchronous processing (e.g. OCR image analysis). |
| **`204`** | `No Content` | Successful `DELETE` request; response contains no payload. |
| **`400`** | `Bad Request` | Request payload failed validation checks. |
| **`401`** | `Unauthorized` | Bearer token is missing, expired, or invalid. |
| **`403`** | `Forbidden` | User is authenticated but does not own or have permission to access the resource. |
| **`404`** | `Not Found` | Target resource does not exist. |
| **`429`** | `Too Many Requests`| API rate limit exceeded. |
| **`500`** | `Internal Error` | Unexpected server-side failure. |

---

## 4. Request DTO Rules

*   **Strict Typing & Validation**: All request payloads must be mapped to distinct DTO (Data Transfer Object) classes (Java `record` types on the backend) annotated with Bean Validation constraints (e.g. `@NotNull`, `@Size`, `@Email`).
*   **Naming Schema**: Append `Request` to the end of the class name (e.g., `UpdateVehicleRequest`).
*   **JSON Property Naming**: Use camelCase for all JSON request keys.

---

## 5. Response DTO Rules

*   **JPA Entity Hiding**: Never return database entities directly. Always map database objects to response DTOs using a mapping layer (e.g. MapStruct) before returning them to the controller.
*   **Naming Schema**: Append `Response` to the end of the class name (e.g., `VehicleResponse`).
*   **JSON Property Naming**: Use camelCase for all JSON response keys.

---

## 6. Standard Error Format

When an API fails (`4xx` or `5xx` statuses), the response must return a standardized JSON object:

```json
{
  "timestamp": 1719875600000,
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: License plate format is invalid.",
  "path": "/api/v1/vehicles"
}
```

*   **`timestamp`**: Unix epoch milliseconds.
*   **`status`**: HTTP status code.
*   **`error`**: HTTP error phrase.
*   **`message`**: A clear, localized, user-friendly description of the error.
*   **`path`**: Request path that triggered the failure.

---

## 7. Pagination

All endpoints that return lists of objects must implement pagination using standard query parameters:

*   **Query Parameters**:
    *   `page`: Page index (0-based indexing; defaults to `0`).
    *   `size`: Number of records per page (defaults to `20`, max `100`).
*   **Response Structure**: Paginated results must be wrapped in a metadata container:

```json
{
  "content": [
    { "id": "uuid-1", "licensePlate": "AA-123-BB" }
  ],
  "page": {
    "size": 20,
    "number": 0,
    "totalElements": 48,
    "totalPages": 3
  }
}
```

---

## 8. Filtering

Filter parameters must be passed as optional query parameters. Do not mix filter operations into the URI path:

*   *Correct*: `GET /api/v1/vehicles?brand=Toyota&status=ACTIVE`
*   *Incorrect*: `GET /api/v1/vehicles/brand/Toyota/status/ACTIVE`

---

## 9. Sorting

Sorting criteria must be passed via a single `sort` parameter:

*   **Format**: `sort=propertyName,direction` (where direction is `asc` or `desc`).
*   **Multiple Fields**: Support sorting by multiple attributes by chaining query params:
    *   `GET /api/v1/vehicles?sort=brand,asc&sort=model,desc`

---

## 10. Versioning

*   **URI Path Versioning**: All endpoints must embed the API version as the first segment of the path following `/api/`:
    *   *Correct*: `/api/v1/vehicles`
*   **Deprecation**: When introducing breaking changes, bump the version segment (e.g. `/api/v2/vehicles`) and support the previous version for a defined deprecation window.

---

## 11. Authentication

*   **OAuth2 Bearer Token**: Use JWT (JSON Web Tokens) passed in the HTTP `Authorization` header:
    *   Format: `Authorization: Bearer <access_token>`
*   **Token Strategy**:
    *   **Access Token**: Short-lived (e.g. 15 minutes), stored in-memory on the client.
    *   **Refresh Token**: Long-lived (e.g. 7 days), stored in a secure, `HttpOnly`, `Secure`, `SameSite=Strict` cookie to prevent theft.

---

## 12. Authorization

*   **Declarative Guarding**: Protect controller methods using Spring Security’s `@PreAuthorize` method annotations:
    ```java
    @PreAuthorize("@securityEvaluator.isVehicleOwner(#vehicleId)")
    @PutMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponse> updateVehicle(...)
    ```
*   **Gateway Rule**: Reject requests without a valid session token before routing them to internal business modules (except for public routes like `/api/v1/auth/login`, `/api/v1/auth/register`).
