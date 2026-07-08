# AutoCare AI Mobile — Folder Structure & Architecture Reference

This document explains the purpose of every folder in the complete React Native Expo directory structure created under `mobile/src/`. This design follows the approved architecture and matches the Spring Boot backend modules for cognitive consistency.

---

## 📂 Complete Folder Tree

```
mobile/src/
├── api/                   # API client configuration and endpoints
├── assets/                # Local asset files (images, icons, fonts, animations)
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── animations/
├── components/            # Reusable UI component tiers
│   ├── ui/                # Base design system primitives (Button, Input, Card)
│   ├── feedback/          # Global feedback (Toast, EmptyState, OfflineBanner)
│   ├── layout/            # Layout wrappers (ScreenContainer, SectionHeader)
│   ├── form/              # React Hook Form field controls (FormField, FormSelect)
│   └── domain/            # Domain-specific displays (VehicleCard, ChatBubble)
├── constants/             # Centralized config values, query keys, configurations
├── hooks/                 # TanStack Query query/mutation hooks per feature
│   ├── auth/              # Login, register, logout, reset password mutations
│   ├── user/              # Profile read/write queries
│   ├── vehicle/           # Vehicle CRUD operations
│   ├── brand/             # Vehicle brand and model reference data
│   ├── component/         # Component details and types
│   ├── maintenance/       # Service history logs
│   ├── invoice/           # Invoice OCR scan workflows
│   ├── expense/           # Odometer, fuel, repair billing logs
│   ├── notification/      # Maintenance schedules, system notifications
│   ├── conversation/      # AI assistant chat logs
│   ├── garage/            # Service garages/mechanics directories
│   ├── dashboard/         # Aggregated stats, valuation reports
│   └── common/            # Shared utility hooks (debounce, network state, etc.)
├── lib/                   # Third-party library integrations (MMKV, secure-store)
├── navigation/            # Navigation structure (stacks, tabs, types)
├── providers/             # Global React Context providers (Query, Safe Area, etc.)
├── screens/               # Feature screens orchestration
│   ├── auth/              # Registration, login, password recovery
│   ├── home/              # Main app landing dashboard
│   ├── vehicle/           # Vehicle dashboard, detail sheets
│   ├── component/         # Parts status and lifespan checksheets
│   ├── maintenance/       # Service logs list and additions
│   ├── invoice/           # OCR file trigger, scanning, and validation flow
│   ├── expense/           # Cost charts, analytics graphs
│   ├── notification/      # Alarm, alerts list
│   ├── conversation/      # AI interactive assistant chat interface
│   ├── garage/            # Garage locator / select interfaces
│   ├── dashboard/         # Valuation calculators, platform stats
│   └── profile/           # User configuration, security switches
├── services/              # Cross-concern orchestrators (image compression, upload)
├── stores/                # Zustand global stores (authentication, current active vehicle)
├── theme/                 # Styling configuration and typography files
├── types/                 # TypeScript type files mapping to DTOs
├── utils/                 # General helper utilities (formatters, error handlers)
└── validation/            # Zod schemas matching backend validations
```

---

## 📖 Folder Explanations

### 1. `api/`
- **Purpose**: Houses the centralized API configuration, including the customized Axios instance (`client.ts`), routes definitions (`endpoints.ts`), and feature-specific network request files.
- **Design Rationale**: Decouples network request calls from React lifecycle hooks, making them easier to test, run in headless environments, or wrap inside distinct custom query hooks.

### 2. `assets/`
- **Purpose**: A local folder containing all static assets bundled with the mobile application.
  - `images/`: Local files such as app logo, splash graphics, and empty-state placeholders.
  - `icons/`: Custom SVG or custom asset graphics that are not part of standard vector packages.
  - `fonts/`: Typography styles (Inter) configured locally to match typography standards.
  - `animations/`: Interactive animation JSON files (e.g., Lottie checkmarks or scanning wheels).

### 3. `components/`
- **Purpose**: General components directory segmented into abstraction tiers:
  - `ui/`: Design system primitives (e.g., `Button`, `Input`, `Text`) with no business logic.
  - `feedback/`: Interactive alerts, spinner screens, confirm popups, and the network offline indicator banner.
  - `layout/`: Reusable layouts that wrap screens, handling safe area insets and keyboard display offsets.
  - `form/`: Wrapper controls that bind React Hook Form Controllers to the `ui/` inputs, reducing form boilerplate.
  - `domain/`: Business components like a `VehicleCard` or a `ChatBubble` that display domain-specific objects.

### 4. `constants/`
- **Purpose**: Holds static configuration values. Includes the API base URL, timeout durations, and the query keys factory dictionary.

### 5. `hooks/`
- **Purpose**: Hosts custom React hooks. Includes:
  - Feature folders containing **TanStack Query** queries and mutations (e.g., `useVehicles` under `vehicle/`, `useConfirmInvoice` under `invoice/`).
  - `common/`: General hooks for network status, keyboard listeners, application state tracking, etc.

### 6. `lib/`
- **Purpose**: Wrapper settings for third-party tools. Provides unified interfaces for local database storage (MMKV), secure token keychains, Axios caching, and the default toast layout manager.

### 7. `navigation/`
- **Purpose**: Contains the navigation hierarchy (AuthStack, MainStack, BottomTabs) and types parameters mapping. By managing param lists and options here, we ensure screen routing is completely type-safe.

### 8. `providers/`
- **Purpose**: Groups all root-level app context wrappers (e.g., the global ErrorBoundary fallback, the TanStack Query provider, and theme managers) into a single nested composition block (`AppProviders.tsx`).

### 9. `screens/`
- **Purpose**: Houses screen controllers. Screen files here act as orchestration layers that fetch state using custom query hooks, bind layout components, and handle user navigation. They do not execute direct API queries or modify stores directly.

### 10. `services/`
- **Purpose**: Coordinates multi-step business actions. Examples include handling an image upload (which requires camera trigger -> compression -> cloud upload -> callback URL extraction).

### 11. `stores/`
- **Purpose**: Holds Zustand global stores for light, sync state. Stores cover credentials persistence, current selected vehicle ID context, global screen settings, and onboarding progress flags.

### 12. `theme/`
- **Purpose**: Core configuration for styling variables, including typography sizing, Tailwind variables setup, NativeWind dark/light custom utilities, and color scheme objects.

### 13. `types/`
- **Purpose**: TypeScript type declaration files. Features are typed to match Spring Boot DTO schemas 1:1, guaranteeing contract type-safety between front-end and back-end teams.

### 14. `utils/`
- **Purpose**: Pure utility functions with no React logic. Includes date formats, currency formatters, error parsers, and device platform checks.

### 15. `validation/`
- **Purpose**: Zod validation schemas. Validates input values (e.g., during registration or vehicle addition) on the client side, matching backend validation logic before sending data over the network.
