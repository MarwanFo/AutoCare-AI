# React Admin Panel — Scalable Feature-Based Architecture
**Scope**: Frontend Directory Structure and Domain Bounded Contexts

---

## 1. Directory Tree Architecture

```
src/
├── api/                          # Global Axios client instance & security interceptors
│   └── client.js                 # Base Axios configurator
├── app/                          # Core application providers and bootstrap logic
│   ├── queryClient.js            # TanStack Query global client instance
│   └── App.jsx                   # Application root entry (Providers/Router wrapper)
├── assets/                       # Global static assets
│   ├── fonts/                    # Locally hosted typography packages
│   ├── icons/                    # General SVG raw resources
│   └── images/                   # High-res graphics, logo configurations
├── components/                   # Shared UI component registry (cross-feature)
│   ├── common/                   # Primitive widgets (Badge, StatusIndicators)
│   ├── forms/                    # Form input wrappers (FormField, FileUploadField)
│   ├── layout/                   # Structural page containers (PageHeader, Shell)
│   └── ui/                       # shadcn/ui components (automatically added via CLI)
├── constants/                    # Application-wide static definitions
│   ├── enums.js                  # System-wide status and role mappings
│   ├── endpoints.js              # Central backend API route dictionary
│   └── queryKeys.js              # Constant registry for TanStack Cache invalidation
├── features/                     # Feature-Based Modules (Domain Bounded Contexts)
│   ├── analytics/                # Multi-dimensional reporting, charts, and data aggregators
│   ├── auth/                     # Session state, login, password recovery, guards
│   ├── dashboard/                # Landing panel metrics, activity feeds, overview grids
│   ├── expenses/                 # Invoices scan, receipt uploads, mileage cost logs
│   ├── maintenance/              # Service event booking, logs histories, schedules
│   ├── notifications/            # Real-time WebSockets feed, user preferences toggles
│   ├── profile/                  # Active user credentials and configuration forms
│   ├── settings/                 # General configurations, configurations, flags
│   ├── shared/                   # Shared domain components (e.g. VehiclePicker.jsx)
│   ├── users/                    # User accounts directory, permissions, details
│   └── vehicles/                 # Fleet list, specifications forms, lifecycle tracking
├── hooks/                        # Global reusable utility hooks (e.g. useDebounce)
├── layouts/                      # Page templates and shells (AdminLayout, GuestLayout)
├── lib/                          # Third-party configurations (e.g. Zod configurations)
├── routes/                       # React Router configuration and guards (appRoutes.jsx)
├── services/                     # Multi-domain orchestrator services (e.g. printReports)
├── styles/                       # Global Tailwind base styles and CSS variables
└── utils/                        # Pure JavaScript helper functions (formatters, parsers)
```

---

## 2. Directory Responsibilities

### Core Base Folder Layer

*   **`src/api/`**
    *   *Responsibility*: Configures HTTP networking. Defines the central Axios wrapper instance. Implements HTTP request/response interceptors to automatically inject authorization headers, capture 401 statuses to perform silent token refreshing, and catch 500 exceptions to format generic user-friendly alerts.
*   **`src/app/`**
    *   *Responsibility*: App bootstrapping. Initializes root React Context providers, configures the global `QueryClient` cache lifecycle settings, and mounts the base root view.
*   **`src/components/`**
    *   *Responsibility*: Houses generic, non-domain-specific components.
        *   `common/`: Standard utility elements like custom spin-loaders, tooltip wraps, or status badges.
        *   `forms/`: Controls that wrap native inputs (e.g. wrapper around react-datepicker).
        *   `layout/`: Structures like generic grid panels, dashboard section dividers, or scrollable sheets.
        *   `ui/`: The registry for all shadcn/ui components (e.g., `button.jsx`, `dialog.jsx`). These are strictly structural primitives that have no knowledge of business logic.
*   **`src/constants/`**
    *   *Responsibility*: Single source of truth for immutable configuration values. Prevents hardcoding of string variables.
*   **`src/hooks/`**
    *   *Responsibility*: Global React hooks. Contains reusable, domain-agnostic custom hooks such as UI helpers (`useMediaQuery`), network status indicators (`useOnlineStatus`), or event helpers (`useDebounce`).
*   **`src/layouts/`**
    *   *Responsibility*: View templates. Implements structural page outlines (e.g. `AdminLayout.jsx` with sidebar and global header, `AuthLayout.jsx` with centered card).
*   **`src/routes/`**
    *   *Responsibility*: Navigation engine. Handles route definitions, dynamic layouts binding, and route guards (e.g. protecting `/admin/*` via an auth checking hook).
*   **`src/services/`**
    *   *Responsibility*: Global cross-cutting services. Handles logic that spans multiple different features, such as file export orchestrators.
*   **`src/styles/`**
    *   *Responsibility*: Holds CSS declarations. Configures Tailwind base layers, sets global style resets, and defines light/dark design theme colors.
*   **`src/utils/`**
    *   *Responsibility*: Pure functional helpers. Stateless JS utilities (e.g. currency conversion, date formatting, error object parsing) which are completely side-effect free.

---

## 3. Feature Directory Pattern

For maximum scalability up to **100+ pages**, every domain module inside `src/features/*` utilizes a strict sub-architecture to enforce boundaries and prevent modular pollution:

```
src/features/vehicles/
├── README.md                     # Feature boundary and documentation manifest
├── components/                   # Sub-components unique to the vehicle module
│   ├── VehicleGrid.jsx           # Cards view for dashboard inventory
│   └── VehicleForm.jsx           # Form for adding/editing vehicles
├── hooks/                        # React Query hook wrappers
│   ├── useVehicles.js            # query: GET /api/v1/vehicles
│   └── useCreateVehicle.js       # mutation: POST /api/v1/vehicles
├── services/                     # Direct HTTP request functions
│   └── vehicleApi.js             # axios-client calls
├── schemas/                      # Input verification schemas
│   └── vehicleSchema.js          # Zod model for vehicle data validation
└── stores/                       # Zustand slice
    └── vehicleStore.js           # Vehicle-specific client state (e.g., selected vehicle)
```

### Feature Boundary Rules
1. **Domain Isolation**: Code inside `features/vehicles` should not directly import from `features/expenses/components`. Instead, if components must work together, they are placed in `features/shared` (cross-cutting domain elements) or the root-level `components/` folder.
2. **Explicit Entry Points**: Use index files inside each folder where appropriate to act as clean public APIs for other modules, preventing deep nesting imports (e.g., `import { useVehicles } from '@/features/vehicles'`).
3. **Zustand Splitting**: Do not create a single global monolithic state store. Each feature owns its state store inside its `stores/` folder, ensuring independent, fast state slices.
