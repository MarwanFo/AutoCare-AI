# Notifications Feature Module
Distributes system announcements, warnings, real-time toast popups, and updates feed.

## Directory Roles
- **components/**: NotificationDropdown.jsx, ToastAlert.jsx, and PreferencesForm.jsx.
- **hooks/**: Subscribes to real-time events (e.g., useNotificationFeed, useMarkAsRead).
- **services/**: REST endpoints for /api/v1/notifications/*.
- **schemas/**: Validations for notification options and alert priorities.
- **stores/**: Unread notification badges and local notification cache.
