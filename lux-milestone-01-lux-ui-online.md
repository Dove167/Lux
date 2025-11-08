# Lux Milestone 01 — Smooth, Animated Storefront Online

## Snapshot

- Hero: Live with Lenis-powered smooth scroll + Anime.js intro.
- ProductGrid: Hydrated from SSR `data-props` with graceful fallback to `/api/products`.
- Product cards: Rendering in a clean, high-end layout with subtle motion.
- Architecture: Matches [`lux-modular-ui-architecture.md`](lux-modular-ui-architecture.md) + [`lux-next-todos-and-docs.md`](lux-next-todos-and-docs.md) core design.

This is an architecture milestone: the modular UI, progressive hydration, and animation layer are now proven in-browser.

---

## What's Done (Architecture-Level)

- Routing / assets:
  - `/static/js/...` + `/static/...` paths aligned with server + EJS imports.
- Progressive Hydration:
  - [`ProgressiveHydrator.js`](public/js/utils/ProgressiveHydrator.js) cleanly hydrates `Hero` + `ProductGrid`.
- Scroll + Animation System:
  - [`scroll.js`](public/js/utils/scroll.js) exposes:
    - `smoothScroll` (Lenis wrapper)
    - `animationManager` (Anime.js helpers: fades, slides, staggers).
- Components:
  - [`Hero.js`](public/js/components/Hero.js) uses animationManager for entrance + CTA scroll.
  - [`ProductCard.js`](public/js/components/ProductCard.js) wired for hover/interaction animations.
  - [`ProductGrid.js`](public/js/components/ProductGrid.js):
    - Uses SSR `data-props.products` when present.
    - Falls back to `/api/products` fetch only if needed.
    - Renders card shells that ProgressiveHydrator can enhance.
    - Emits `products:loaded` for observers (infinite scroll / metrics).

Result: The storefront looks and feels like a focused luxury experience with robust, framework-lite plumbing.

---

## Still Open (Next Micro-Milestones)

1. Cart interactions
   - Wire `ProductCard` "Add to Cart":
     - Emit `cart:add` via [`EventBus.js`](src/utils/EventBus.js).
     - Update [`CartStore.js`](src/utils/CartStore.js) counts.
     - Reflect in Cart icon + [`CartModal.js`](src/components/CartModal.js).
   - Add Anime.js micro-feedback:
     - Button pulse / icon pop / subtle card nudge.

2. Admin UI
   - Implement modular admin panel in [`public/admin.ejs`](public/admin.ejs).
   - CRUD via `/api/products` with same component conventions.

3. Persistence (Optional)
   - Swap product source to SQLite per [`src/db/schema.sql`](src/db/schema.sql).

4. Docs Sync
   - Update:
     - [`lux-modular-ui-architecture.md`](lux-modular-ui-architecture.md)
     - [`lux-next-todos-and-docs.md`](lux-next-todos-and-docs.md)
   - Ensure they describe:
     - Lenis + Anime.js integration.
     - SSR → data-props → hydration flow.
     - Cart + admin patterns once implemented.

---

## Milestone Definition

Milestone 01 is considered COMPLETE because:

- The visual identity and motion system are live.
- The modular runtime (components + hydrator + scroll/animation) is validated.
- The remaining work (cart, admin, persistence, tests) can now build on a stable, documented foundation.
