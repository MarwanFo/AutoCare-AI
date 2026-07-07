# Shared Feature Module
Stores components and services that are reused across multiple feature contexts but are not generic enough to belong to root-level /components.

## Directory Roles
- **components/**: Sub-domain components like VehiclePicker.jsx or UserComboSelector.jsx that cross-cut several modules.
- **hooks/**: Shared feature hooks like fetching lists of active garages/locations.
- **services/**: Multi-entity endpoints.
- **schemas/**: General formats (e.g., standard address or phone schemas).
- **stores/**: Shared feature state context.
