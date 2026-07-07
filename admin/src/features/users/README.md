# Users Feature Module
Provides directory listings, creation wizards, editing panels, and authorization roles management for system users.

## Directory Roles
- **components/**: Houses UserTable.jsx, UserForm.jsx, RoleSelector.jsx, and UserDetailModal.jsx.
- **hooks/**: Orchestrates pagination and user CRUD operations (e.g., useUsersList, useCreateUser, useUpdateUser).
- **services/**: Direct REST calls targeting /api/v1/users/*.
- **schemas/**: Zod schemas for user profile forms and registration logic.
- **stores/**: Local temporary states (like multiselect indexes, bulk action queues).
