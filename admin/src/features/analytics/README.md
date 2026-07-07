# Analytics Feature Module
Visualizes business performance, expense breakdowns, fleet utilization, and AI reports.

## Directory Roles
- **components/**: Charts (Recharts wrapper components) and PDF report exporter forms.
- **hooks/**: Visual data transformations (e.g., useFleetUtilization, useExpenseBreakdowns).
- **services/**: Fetches aggregated reports from /api/v1/analytics/*.
- **schemas/**: Dates/periods validation schemas for custom range report requests.
- **stores/**: Stores current charts configuration or visual display filters.
