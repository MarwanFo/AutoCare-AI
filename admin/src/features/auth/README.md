# Auth Feature Module
Handles all security, user session state, login flow, token management, and authentication guards.

## Directory Roles
- **components/**: Contains LoginForm.jsx, RegisterForm.jsx, ForgotPasswordForm.jsx, and security wrappers (e.g., RequireAuth.jsx).
- **hooks/**: Encapsulates authentication queries/mutations (e.g., useLogin, useLogout, useSessionRefresh).
- **services/**: Declares API requests to the /api/v1/auth/* endpoints.
- **schemas/**: Houses Zod models for credentials validation and request payloads.
- **stores/**: Manages the global Zustand store holding current JWT token, expiration timestamp, and roles.
