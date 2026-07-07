# AutoCare AI — Engineering Guide & Development Rules

This document outlines the mandatory engineering standards, guidelines, and quality standards for the AutoCare AI project. All development team members must adhere strictly to these rules.

---

## 1. General Engineering Principles

*   **Simplicity and Cleanliness**: Avoid over-engineering. Write clean, readable code over clever or complex code.
*   **Single Source of Truth**: The approved Stitch designs are the absolute source of truth for the user interface. Never redesign screens, change layout grids, or modify styles unless explicitly requested.
*   **Reuse Over Recreation**: Search for and reuse existing components, hooks, utilities, and helper methods before implementing new ones.
*   **Layer-by-Layer Generation**: Generate only the requested layer. Wait for approval before proceeding to the next layer. Never modify files outside the current work scope.

---

## 2. Project Structure Rules

*   **Modular Monolith Architecture**: The codebase is partitioned into distinct sub-modules representing bounded contexts. Keep inter-module dependencies minimal.
*   **Feature-Based Folder Layout**:
    *   **Backend**: Group code under domain packages (e.g. `com.autocare.vehicle`) containing `controller`, `dto`, `service`, `repository`, `entity`, and `mapper` sub-folders.
    *   **Frontend & Mobile**: Group code under feature folders (e.g. `src/features/vehicles`) containing `components`, `hooks`, `services`, `schemas`, and `stores` directories.

---

## 3. Folder Naming Conventions

*   **Java Packages**: Lowercase alphanumeric without spaces or separators (e.g. `com.autocare.maintenance`).
*   **Frontend Features**: Lowercase, kebab-case (e.g. `src/features/notifications`).
*   **Static Resource Paths**: Lowercase, kebab-case (e.g. `assets/images/brand-logos`).

---

## 4. File Naming Conventions

*   **Java Classes**: PascalCase (e.g. `VehicleService.java`).
*   **SQL Migrations**: Flyway format: `V{Version}__{Description}.sql` (e.g. `V1__init_schema.sql`).
*   **React Components**: PascalCase (e.g. `LoginForm.jsx`).
*   **React Hooks**: camelCase starting with `use` (e.g. `useVehicles.js`).
*   **JavaScript Utilities / Constants**: camelCase or kebab-case (e.g. `dateFormatter.js`, `query-keys.js`).

---

## 5. Java Naming Conventions

*   **Variables & Methods**: camelCase (e.g. `currentOdometer`, `calculateTotalCost`).
*   **Constants**: UPPER_SNAKE_CASE (e.g. `DEFAULT_PAGE_SIZE`).
*   **Interfaces**: PascalCase without prefixes (e.g. `VehicleService` instead of `IVehicleService`).
*   **Implementations**: PascalCase appending `Impl` (e.g. `VehicleServiceImpl`).

---

## 6. React Naming Conventions

*   **Component Files**: PascalCase (e.g. `StatCard.jsx`).
*   **Hook Files**: camelCase starting with `use` (e.g. `useOdometerUpdate.js`).
*   **Store Files**: camelCase ending with `Store` (e.g. `authStore.js`).
*   **Context Files**: PascalCase ending with `Context` (e.g. `ThemeContext.jsx`).

---

## 7. React Native Naming Conventions

*   **Screen Components**: PascalCase ending with `Screen` (e.g. `VehicleDetailsScreen.jsx`).
*   **Navigation Adapters**: PascalCase ending with `Navigator` (e.g. `RootNavigator.jsx`).
*   **Style Sheets**: camelCase (e.g. `styles.js` or `containerStyles`). Use Tailwind CSS (`twrnc`) where configured, otherwise StyleSheet API.

---

## 8. DTO Rules

*   **Separation of Concerns**: DTOs (Data Transfer Objects) are the only entities exposed at the API controller boundary. Never expose JPA Entities directly.
*   **Naming Conventions**:
    *   Requests: `[Action][Entity]Request` (e.g. `CreateVehicleRequest`).
    *   Responses: `[Entity]Response` (e.g. `VehicleResponse`).
*   **Immutability**: DTOs should be immutable. In Java, use `record` types for all standard requests/responses.

---

## 9. Entity Rules

*   **Lombok Annotations**: Avoid using `@Data` on JPA entities due to potential infinite loops in `hashCode` and `toString` when using relationships. Use `@Getter`, `@Setter`, `@RequiredArgsConstructor`, and override `equals` and `hashCode` explicitly if needed.
*   **Auditing**: Extend a base audited class (e.g., `BaseEntity`) containing `@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, and `@LastModifiedBy`.
*   **Primary Keys**: Use UUIDs or sequenced bigints. Always define primary key constraints explicitly.

---

## 10. Service Rules

*   **Transactional Boundary**: All write operations must be marked with `@Transactional`. Default read-only methods to `@Transactional(readOnly = true)`.
*   **Cross-Module Coupling**: Never invoke another module's repository directly. Use local domain service boundaries or decouple operations using Spring Application Events.
*   **Interface Separation**: Declare public interfaces for business actions, and provide `@Service` implementation classes separately.

---

## 11. Repository Rules

*   **ReadOnly Queries**: Avoid writing custom query queries inside service loops. Use Spring Data JPA native queries or query methods.
*   **Query Naming**: Follow standard Spring Data conventions (e.g., `findByLicensePlate`). Use `@Query` with named parameters for complex SQL queries.

---

## 12. Controller Rules

*   **Routing Path**: Standardize endpoints using lowercase plurals (e.g., `@RequestMapping("/api/v1/vehicles")`).
*   **Validation**: Annotate all request bodies with `@Valid` to trigger automatic boundary validation checks.
*   **Execution Mapping**: Delegate all orchestration and business calculation logic to the service layer. Keep controller methods to request mapping and response returning.

---

## 13. API Rules

*   **Status Codes**:
    *   `200 OK` for successful read/update operations.
    *   `201 Created` for successful resource creations.
    *   `202 Accepted` for accepted async operations.
    *   `204 No Content` for successful deletes.
    *   `400 Bad Request` for validation failures.
    *   `401 Unauthorized` for missing/expired session tokens.
    *   `403 Forbidden` for resource ownership validation failures.
    *   `404 Not Found` for resource query misses.
*   **Format**: Use JSON format only. Maintain consistent key formatting (camelCase for request and response JSON properties).

---

## 14. Error Handling Rules

*   **Global Exception Handling**:
    *   **Backend**: Use `@ControllerAdvice` / `@RestControllerAdvice` to capture custom business exceptions and output standardized JSON error payloads.
    *   **Frontend**: Wrap components in React Error Boundaries to catch render errors without causing app crashes.
*   **Standard Error Format**: All error responses must return:
    *   `timestamp`: Epoch millis or ISO datetime.
    *   `status`: HTTP Status Code.
    *   `error`: Short error type.
    *   `message`: User-friendly descriptive error explanation.
    *   `path`: Request URI resource.

---

## 15. Logging Rules

*   **Framework**: SLF4J with Logback.
*   **Logging Levels**:
    *   `INFO` for critical system startup events, migration summaries, and boundary transactions.
    *   `WARN` for recoverable errors or bad request exceptions.
    *   `ERROR` for system crashes, API failures, or transaction rollback scenarios.
*   **Sensitive Data**: Never log passwords, tokens, full credit cards, or decrypted personal user identifiers.

---

## 16. Security Rules

*   **Stateful Token Storage**: Store JWT tokens in memory; refresh tokens must be stored in secure, HttpOnly, SameSite cookies to protect against XSS and CSRF attacks.
*   **Resource Ownership Checks**: Guard endpoints with `@PreAuthorize` method annotations that check resource ownership against the currently authenticated security principal.
*   **Password Security**: Use BCryptPasswordEncoder for password hashing.

---

## 17. Git Workflow

*   **Base Branches**: `main` (production-ready deployment) and `develop` (integration branch).
*   **Feature Branches**: Branch off from `develop` and merge back into `develop` via pull requests.
*   **Hotfix Branches**: Branch off from `main` and merge back to both `main` and `develop`.

---

## 18. Branch Naming

*   `feature/` — New feature implementations (e.g. `feature/user-authentication`).
*   `bugfix/` — Bug corrections (e.g. `bugfix/license-plate-validation`).
*   `hotfix/` — Production system corrections (e.g. `hotfix/token-refresh-leak`).
*   `refactor/` — Code maintenance or structure changes (e.g. `refactor/api-folder-layout`).

---

## 19. Commit Convention (Conventional Commits)

Commit messages must follow the specification: `<type>(<scope>): <description>`
*   `feat`: A new feature introduction (e.g. `feat(auth): add refresh token endpoint`).
*   `fix`: A bug correction (e.g. `fix(vehicles): resolve odometer update rounding`).
*   `docs`: Documentation updates only.
*   `style`: Formatting or visual changes (no logic affected).
*   `refactor`: Code reorganization or structural cleaning.
*   `test`: Introducing unit or integration tests.
*   `chore`: Tooling, build files, or package dependencies updates.

---

## 20. Code Review Checklist

1. Does the code follow the design specifications?
2. Are there any direct imports of repositories/entities across feature boundary modules?
3. Does every write endpoint use proper validation and transactional configurations?
4. Are database changes defined via Flyway SQL migration scripts?
5. Has proper security (authorization checks) been added?
6. Are secrets and environment parameters stored in configurations rather than source code?

---

## 21. Performance Guidelines

*   **Database**: Avoid the N+1 query problem by using entity graphs or join fetches. Index foreign keys.
*   **State**: Optimize rendering in React using proper key definitions, useMemo, and useCallback where necessary.
*   **Network**: Leverage TanStack Query cache properties to minimize redundant REST API calls.

---

## 22. Accessibility Guidelines

*   **Semantic Markup**: Use standard HTML5 layout components (`<header>`, `<nav>`, `<main>`, `<section>`).
*   **Inputs**: Ensure all input controls have visible, descriptive labels matching their `htmlFor` and `id` references.
*   **Alt Text**: Provide relevant `alt` text for images.

---

## 23. Testing Guidelines

*   **Coverage**: Prioritize testing key business logic (services) and data boundaries (repositories).
*   **Unit Tests**: Mock external dependencies (e.g., using Mockito in Java).
*   **Integration Tests**: Test controllers and JPA behaviors against a Testcontainers or temporary H2/PostgreSQL instance.

---

## 24. Definition of Done

A task is marked as "Done" *only* when it meets the following criteria:
1. The code compiles and builds successfully without warnings.
2. All unit and integration tests execute successfully.
3. API endpoints are documented and validated against API schemas.
4. The user interface matches the approved Stitch designs exactly.
5. All security checks (JWT authorization, resource ownership validations) are implemented.
6. The codebase has been reformatted and conforms to all conventions in this guide.
