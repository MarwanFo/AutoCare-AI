# Maintenance Feature Module
Schedules service events, records technician notes, and logs completed repairs.

## Directory Roles
- **components/**: Calendar views, ServiceJobForm.jsx, and RepairLogTable.jsx.
- **hooks/**: Handles scheduling transactions and service histories (e.g., useMaintenanceJobs, useLogJob).
- **services/**: REST calls for /api/v1/maintenance/*.
- **schemas/**: Validations for maintenance dates, work order scopes, and technician info.
- **stores/**: Temporary calendar filter criteria.
