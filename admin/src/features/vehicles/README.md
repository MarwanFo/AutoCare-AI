# Vehicles Feature Module
Manages the fleet lifecycle, registration details, mileage trackers, and manufacturer specifications.

## Directory Roles
- **components/**: Includes VehicleGrid.jsx, VehicleSpecsForm.jsx, and OdometerUpdateModal.jsx.
- **hooks/**: React Query mappings for fetching fleet statuses (e.g., useVehicles, useUpdateOdometer).
- **services/**: API requests targeting /api/v1/vehicles/*.
- **schemas/**: Zod models for license plates, VIN formatting, and metadata fields.
- **stores/**: Filter and pagination context for the vehicle browser view.
