# Future Lux Components

Goal: Design a cohesive set of Lux primitives (inspired by shadcn/ui) that plug into:

- [`public/js/utils/BaseComponent.js`](public/js/utils/BaseComponent.js)
- [`public/js/utils/ComponentRegistry.js`](public/js/utils/ComponentRegistry.js)
- [`public/js/utils/ProgressiveHydrator.js`](public/js/utils/ProgressiveHydrator.js)
- EJS + data-component SSR pattern

Each component:
- SSR-first HTML.
- Styled via `/main.css` (or scoped CSS).
- Hydrated via `data-component` + ComponentRegistry.
- No React/JSX; pure ESM classes extending `BaseComponent`.

---

## 1. Layout & Navigation

### LuxNav (v1 done)
- Status: Implemented via `LuxPrimitives` + components catalog.
- Next:
  - Support dropdown menus via data-props:
    - sections, active route, cart badge.

### LuxTabs
- Use cases:
  - Product details, admin panels, docs-style layouts.
- API:
  - data-component="LuxTabs"
  - data-props='{"tabs":[{"id":"details","label":"Details"},{"id":"specs","label":"Specs"}],"active":"details"}'
- Behavior:
  - SSR: show first tab panel.
  - Hydration: click → switch active, animate underline.

### LuxBreadcrumb
- Use cases:
  - Hierarchical navigation on components/docs.
- API:
  - data-component="LuxBreadcrumb"
  - data-props='{"items":[{"label":"Home","href":"/"},{"label":"Components","href":"/components"},{"label":"LuxTabs"}]}'
- Behavior:
  - Simple inline trail with separators.

### LuxSidebar
- Use cases:
  - Admin, docs nav, component catalog index.
- API:
  - data-component="LuxSidebar"
  - props for sections + collapsible groups.

---

## 2. Forms & Input

Shared:
- Base: `LuxInputBase` extends `BaseComponent`.
- Focus: tight spacing, pill/rounded shapes, subtle borders.

### LuxInput
- Text input with label, description, error.
- SSR-only: semantic label + input.
- Hydration: optional validation hooks.

### LuxSelect
- Custom select with floating panel.
- Progressive: default native `<select>` SSR; enhance to styled panel.

### LuxCheckbox / LuxRadioGroup
- Inline / stacked layouts.
- Accessible focus + keyboard.

### LuxTextarea
- Multi-line notes.
- Auto-resize on input.

### LuxSwitch
- Toggle (for filters, settings).
- SSR: checkbox fallback; hydrate to animated switch.

### LuxForm
- Pattern:
  - Wire multiple Lux inputs.
  - Handle submit state, validation, error toasts.

---

## 3. Data Display

### LuxTable
- Use:
  - Orders, products, analytics.
- Features:
  - SSR table.
  - Hydration: sort-by-column, basic filter (no heavy grid lib).

### LuxBadge
- Small label/pill.
- Variants: default, success, warning.
- Composed inside Cards/Tables.

### LuxAvatar
- Circle user image / initials.
- Used in nav, admin.

### LuxProgress
- Slim progress bar (checkout, uploads).
- SSR: static; hydrate: animate from 0 → value.

### LuxPagination
- Reusable pagination bar.
- Emits events to container or fetch logic.

### LuxSlider
- Range slider for price/filters.
- SSR: input[type=range]; hydrate: stylized track/labels.

### LuxSeparator
- Simple horizontal rule with Lux spacing.

### LuxCard (v1 done)
- Status: Implemented as primitive.
- Next:
  - API for variants (outline, soft, metric card).
  - Slots for icon/eyebrow/footer.

---

## 4. Feedback & Overlays

### LuxToast (v1 done)
- Already wired via EventBus.
- Next:
  - Queue + stacked toasts.
  - Types: success, error, info.

### LuxAlert
- Inline alert banners (above forms/sections).
- Variants via data-props.

### LuxDialog
- Centered modal with overlay.
- SSR: accessible structure.
- Hydration: open/close, focus trap, ESC to close.

### LuxPopover
- Trigger + floating panel.
- Used for small menus, info.

### LuxTooltip
- Text tooltip on hover/focus.
- Low JS; uses data attributes + small positioning logic.

### LuxSkeleton
- Shimmer placeholders for cards, text lines.
- SSR skeleton; hydration toggles to content.

---

## 5. Implementation Plan (Token-Efficient / Gua Style)

1. Core primitives (already/next):
   - LuxButton, LuxCard, LuxToast, LuxNav (done)
   - + LuxTabs, LuxDialog, LuxInput, LuxBadge, LuxSkeleton (next)

2. Pattern:
   - For each new component:
     - Add class in `public/js/components/LuxPrimitives.js`.
     - Register in `ComponentRegistry` in `index.ejs` / `components.ejs`.
     - Style in `public/main.css` with minimal, composable rules.

3. Hydration tiers:
   - Critical (nav, toasts): hydrateImmediately.
   - Viewport (cards, tables): IntersectionObserver.
   - Idle (tooltips, skeleton replacement): requestIdleCallback.

This file is a scoped roadmap; next steps can implement components in small, incremental PR-sized batches.