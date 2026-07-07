# Profile Feature Module
Allows logged-in users to update their identity data, passwords, settings, and avatars.

## Directory Roles
- **components/**: ProfileForm.jsx, ChangePasswordForm.jsx, and AvatarUpload.jsx.
- **hooks/**: Processes updates to current user data (e.g., useCurrentUserProfile, useUpdatePassword).
- **services/**: Calls to individual resource endpoint /api/v1/me/*.
- **schemas/**: Validates current profile forms, password security patterns, and size of avatars.
- **stores/**: Stores local profile states.
