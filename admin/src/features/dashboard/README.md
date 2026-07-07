# Dashboard Feature Module
Aggregates summary statistics, system status counters, and operational data grids.

## Directory Roles
- **components/**: UI widgets like StatCard.jsx, RecentActivityWidget.jsx, and overview charts.
- **hooks/**: Logic for polling aggregated backend data (e.g., useDashboardMetrics).
- **services/**: Calls to backend aggregation endpoints /api/v1/dashboard/*.
- **schemas/**: Empty by default; handles query param validations if dashboard filters are added.
- **stores/**: Local dashboard widgets state or visible panel layouts.
