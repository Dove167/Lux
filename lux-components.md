# Lux Component Catalog

Goal: shadcn-style index for all Lux building blocks. Single source of truth for what exists, how to use it, and how it behaves (Lenis + Anime.js + hydration).

---

## 1. Core Runtime

### BaseComponent

- File: [`public/js/utils/BaseComponent.js`](public/js/utils/BaseComponent.js)
- Role:
  - Tiny base class for all interactive components.
  - Handles:
    - `mount(element)` / `hydrate(element)`
    - `setProps(next)` / `setState(next)`
    - Lifecycle hooks:
      - `onBeforeMount` / `onMounted`
      - `onBeforeUpdate` / `onUpdated`
      - `onBeforeUnmount` / `onUnmounted`
- Usage:
  - Extend for any new component to get consistent lifecycle and structure.

### ComponentRegistry

- File: [`public/js/utils/ComponentRegistry.js`](public/js/utils/ComponentRegistry.js)
- Role:
  - `name -> class` map for components.
  - Used by `ProgressiveHydrator` to instantiate from `data-component`.
- Usage:
  - In boot script, register:
    - `componentRegistry.register("Hero", Hero)`
    - `componentRegistry.register("ProductGrid", ProductGrid)`
    - etc.

### ProgressiveHydrator

- File: [`public/js/utils/ProgressiveHydrator.js`](public/js/utils/ProgressiveHydrator.js)
- Role:
  - Scans `[data-component]:not([data-hydrated])`.
  - Dynamically imports corresponding module.
  - Calls `new Component(props).hydrate(element)`.
- Notes:
  - Progressive by design; safe if JS fails (SSR still there).
  - Central place to tweak hydration priority.

### EventBus

- File: [`public/js/utils/EventBus.js`](public/js/utils/EventBus.js)
- Role:
  - Global pub/sub.
  - Example events:
    - `cart:add`
    - `cart:changed`
    - `products:loaded`
- Pattern:
  - `eventBus.on('cart:add', handler)`
  - `eventBus.emit('cart:add', payload)`

### CartStore

- File: [`public/js/utils/CartStore.js`](public/js/utils/CartStore.js)
- Role:
  - Single source of truth for cart state.
  - Emits `cart:changed` on updates.
  - Intended to back header count + `CartModal`.

### Scroll + Animation Layer (`scroll.js`)

- File: [`public/js/utils/scroll.js`](public/js/utils/scroll.js)
- Provides:
  - `smoothScroll`:
    - Lenis-based smooth scrolling helper.
    - Use: `smoothScroll.scrollTo('#products')`.
  - `animationManager`:
    - Anime.js-powered utility:
      - fade/slide intro
      - staggered card entrance
      - small micro-interactions
- Design:
  - Centralized so per-component code stays clean.

---

## 2. Lux UI Components (Current)

### Hero

- File: [`public/js/components/Hero.js`](public/js/components/Hero.js)
- Markup:
  - `data-component="Hero"`
  - `data-props='{"title":"Luxury Sunglasses","subtitle":"...","ctaText":"Shop Now"}'`
- Behavior:
  - Uses `animationManager` for:
    - headline / subtext entrance
    - CTA reveal
  - CTA:
    - `smoothScroll.scrollTo('#products')` (Lenis).
- Notes:
  - Fully functional without JS (SSR text + button).

### ProductGrid

- File: [`public/js/components/ProductGrid.js`](public/js/components/ProductGrid.js)
- Markup:
  - `data-component="ProductGrid"`
  - `data-props='{"products":[...]}`
- Behavior:
  - Reads `props.products` from SSR.
  - If missing, fetches `/api/products` (progressive enhancement).
  - Renders `.product-card-container` entries.
  - Staggered entrance via `animationManager.staggerIn`.
  - Emits `products:loaded` for observers.
- Use When:
  - You want a grid of products with smooth entrance and Lenis-friendly scrolling.

### ProductCard

- File: [`public/js/components/ProductCard.js`](public/js/components/ProductCard.js)
- Expected Markup:
  - Wrapper `data-component="ProductCard"` + `data-props='{"id":...,"name":...,"price":...}'`
- Behavior (intended / partial):
  - Luxury card layout:
    - large image
    - name, price, description
  - Anime.js:
    - subtle hover lift + shadow.
  - Cart:
    - “Add to Cart”:
      - will emit `cart:add` via EventBus (next milestone wiring).
- Status:
  - Visual correct; cart emission to be finalized.

### CartModal

- File: [`public/js/components/CartModal.js`](public/js/components/CartModal.js)
- Role:
  - Listens to `CartStore` / `cart:changed`.
  - Renders items & totals.
- Status:
  - Skeleton; will be finalized with cart wiring and motion.

---

## 3. Lux Primitives Inspired by shadcn/ui

These are the canonical building blocks we will (or do) use repeatedly, mapped from shadcn concepts into Lux style. They live as patterns that can be extracted into components under `public/js/components` and partials in EJS.

### 3.1 Layout & Navigation

- Navigation Bar (LuxNav)
  - Pattern:
    - Minimal top bar with brand + right-aligned actions.
  - Implementation:
    - EJS layout partial.
    - Optional JS for scroll-aware shadow.

- Navigation Menu / Dropdown
  - For account / language / utility.
  - Implement as:
    - `LuxDropdown` component:
      - `data-component="LuxDropdown"` with keyboard-friendly toggling.

- Tabs
  - `LuxTabs`:
    - For switching between content (e.g., product details/specs).
    - Simple `data-component="LuxTabs"` that manages active panels.

- Breadcrumb
  - `LuxBreadcrumb`:
    - SSR only or tiny JS for overflow; text-based, subtle.

- Sidebar
  - Used on admin (`/admin`).
  - `LuxSidebar`:
    - collapsible, minimal, anchored to left.

### 3.2 Forms & Input

Core primitives styled once in CSS, reused everywhere.

- Button (LuxButton)
  - Variants:
    - `primary`, `ghost`, `outline`, `danger`.
  - Used for:
    - CTAs, add-to-cart, admin actions.

- Input (LuxInput)
  - For text / email.
  - With subtle focus ring; matches luxury aesthetic.

- Select (LuxSelect)
- Checkbox (LuxCheckbox)
- Radio Group (LuxRadioGroup)
- Textarea (LuxTextarea)
- Form (LuxForm)
  - Composed with validation + error display.
- Plan:
  - Implement as EJS/CSS primitives with optional `data-component` wrappers for validation and animations.

### 3.3 Data Display

- Card (LuxCard)
  - Generic version of ProductCard surface.
  - Used for content blocks, stats, admin items.

- Table (LuxTable)
  - For admin product lists.
  - Features:
    - Sort icons, zebra rows, responsive.

- Badge (LuxBadge)
  - For status labels (e.g., “New”, “Low stock”).

- Avatar (LuxAvatar)
  - For user/admin profiles.

- Progress (LuxProgress)
  - For loading/ops in admin.

- Calendar / Date Picker
  - `LuxCalendar` (lightweight):
    - SSR grid + optional JS for selection.
  - `LuxDatePicker`:
    - Wraps `LuxCalendar` for forms.

### 3.4 Feedback & Overlays

- Alert (LuxAlert)
  - Inline messages (success/warn/error).

- Toast (LuxToast)
  - Corner notifications:
    - e.g., “Added to cart”.
  - Uses:
    - EventBus: `eventBus.emit('toast', { type, message })`.
    - Anime.js: fade/slide-in/out.

- Dialog (LuxDialog)
  - Centered modal:
    - For confirmations, authentication.

- Popover (LuxPopover)
  - Small anchored bubble for extra info.

- Tooltip (LuxTooltip)
  - Hover/focus info:
    - No heavy deps; pure CSS+tiny JS.

### 3.5 Other Interactive Primitives

- Dropdown Menu (LuxDropdown)
  - See navigation.

- Pagination (LuxPagination)
  - For tables / product feeds.

- Slider (LuxSlider)
  - For price range filter in ProductGrid.

- Switch (LuxSwitch)
  - For toggles (e.g., theme, filters).

- Separator (LuxSeparator)
  - Horizontal/vertical line.

- Skeleton (LuxSkeleton)
  - Loading placeholders:
    - For cards, images, text blocks.

---

## 4. How To Add a New Lux Component

1. Create file under `public/js/components/Name.js`.
2. `export default class Name extends BaseComponent { ... }`
3. In EJS:
   - Wrap region:
     - `data-component="Name"`
     - `data-props='{"...": "..."}'`
4. Register in boot script in [`public/index.ejs`](public/index.ejs):
   - `componentRegistry.register('Name', Name)`
5. Use:
   - `animationManager` for motion.
   - `eventBus` for cross-component events.
   - `CartStore` if cart-related.

---

## 5. Status Summary

- Implemented:
  - Hero, ProductGrid, ProductCard, CartModal (skeleton), core runtime.
- Next Candidates (high impact):
  - LuxButton, LuxCard, LuxToast, LuxDialog, LuxTable, LuxTabs, LuxDropdown, LuxSkeleton.
- Philosophy:
  - All components:
    - SSR-first.
    - Optional JS via `data-component`.
    - Small, composable, luxury aesthetics.
    - Central docs here, similar to shadcn/ui but tuned for Lux.
