# AutoCare AI — UI Implementation & Layout Rules

This document defines the mandatory guidelines and rules for building, styling, and organizing user interface layouts for the AutoCare AI application.

---

## 1. Single Source of Truth (Stitch)

*   **No Creative Redesigns**: The approved Stitch UI designs are the absolute and final source of truth. Do not modify layout parameters, borders, alignment, padding, or margins based on personal preference.
*   **Exact Matches**: Render component sizes, colors, relative offsets, and spacing intervals exactly as specified in the Stitch design system tokens.

---

## 2. Component Integration Stack

*   **Primary Elements**: Construct all UI elements using **shadcn/ui** components.
*   **Custom Styling**: Use utility classes in **Tailwind CSS v4** for custom styling. Avoid inline `style={{ ... }}` objects unless calculating dynamic layout dimensions (e.g., percentage-based loading bars).
*   **Zero Custom CSS**: Do not write custom CSS rules in global stylesheets or CSS modules. Implement all formatting via Tailwind utility definitions.

---

## 3. Design System Alignment

All classes must align with the tailwind theme values configured from our design system:
*   **Border Radius**: Use shadcn theme variables: `rounded-lg` (radius-lg), `rounded-md` (radius-md), and `rounded-sm` (radius-sm).
*   **Borders**: Use custom variable tokens: `border border-border`.
*   **Shadows**: Use standard theme utility values (`shadow-sm`, `shadow`, `shadow-md`).

---

## 4. Component Reuse Policy

*   **Search First**: Before creating a new custom React element, check the following directories for a matching component:
    1.  `src/components/ui/` (shadcn base elements)
    2.  `src/components/common/` (generic layout utilities)
    3.  `src/features/shared/` (shared domain widgets)
*   **Composition**: Assemble complex pages by composing small, modular, single-responsibility components instead of writing long, monolithic JSX structures.

---

## 5. Responsive Design Rules

*   **Mobile-First Approach**: Write responsive utility classes starting from mobile screens up to desktop width limits.
*   **Breakpoints**:
    *   `sm`: `640px` (mobile landscape/small tablets)
    *   `md`: `768px` (standard tablets)
    *   `lg`: `1024px` (laptop screens/small desktops)
    *   `xl`: `1280px` (large high-res desktop views)
*   **Tables and Lists**: Render scrollable card layouts on mobile (`sm` and below) and standard tabular grids on desktop (`md` and above).

---

## 6. Accessibility (a11y) Rules

*   **Contrast**: Keep text readable by aligning with WCAG AA guidelines for font contrast (minimum 4.5:1 ratio).
*   **ARIA attributes**: Use shadcn components to handle ARIA properties and keyboard focus traversal automatically.
*   **Interactive Controls**: Ensure interactive elements have hover and focus states:
    ```html
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
    ```

---

## 7. Dark Mode Integration

*   **Variable Binding**: Use standard color variable utilities (e.g. `bg-background text-foreground`). Never hardcode hex values like `bg-[#ffffff]` or `bg-white` unless specifically required by the design tokens.
*   **Tailwind Integration**: Apply the `dark:` prefix to adjust styles specifically for dark mode:
    ```html
    border-border dark:border-border/20
    ```

---

## 8. Transitions & Animations

*   **Smooth Hover States**: Apply transitions to interactive elements like buttons, links, and dropdowns:
    ```html
    transition-all duration-200 ease-in-out
    ```
*   **CSS Animations**: Leverage tailwind utilities or `tw-animate-css` configurations for slide-ins, fades, and pulse effects. Avoid complex manual keyframe styling.

---

## 9. Spacing Standards

*   **Tailwind Scale**: Rely exclusively on Tailwind’s default spacing scale for margins, padding, and gap spacing:
    *   `gap-2` ($8px$) / `gap-4` ($16px$) for generic layout grids.
    *   `p-4` ($16px$) / `p-6` ($24px$) for card containers and dashboard sections.
    *   `py-2 px-4` for standard input and button padding.

---

## 10. Typography Rules

*   **Primary Font**: Use the Geist Variable typography (`font-sans`) as configured in our Tailwind theme.
*   **Sizing Hierarchy**:
    *   `h1`: `text-3xl font-bold tracking-tight`
    *   `h2`: `text-xl font-semibold`
    *   `h3`: `text-lg font-medium`
    *   `body`: `text-sm text-muted-foreground`

---

## 11. Icon Usage

*   **Lucide Icons**: Use standard Lucide React components (`lucide-react`).
*   **Sizing**: Explicitly define sizing for all icons. Do not leave sizes to default browser rendering:
    *   Use `w-4 h-4` for buttons, table actions, and inline text.
    *   Use `w-5 h-5` for sidebar nav and main headers.
    *   Use `w-8 h-8` or larger for empty/loading status states.

---

## 12. UI Feedback States

Every dynamic page must implement the following three status templates to ensure a clean, reliable user experience:

### A. Loading States
*   **Skeleton Screens**: For data-heavy components (like tables, dashboards, and detail views), use `Skeleton` placeholders that mirror the final UI layout. Do not use generic full-screen overlay spinners unless loading the entire app during boot.

### B. Error States
*   **Inline Warnings**: Use `Alert` components from shadcn to display query failures. Avoid JavaScript alert popups. Provide clear instructions and a **Retry** button so users can re-trigger the failed API request.

### C. Empty States
*   **Informative Empty Cards**: When query lists return no data, display a centered layout containing:
    *   A descriptive Lucide icon.
    *   An explanatory title (e.g., "No vehicles registered yet").
    *   A clear call-to-action button (e.g., "Add vehicle") to help users get started.
