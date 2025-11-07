# Lux Modular UI Architecture Plan

Goal: A small, understandable, framework-lite modular UI system using:

- Bun + Hono for HTTP + routing
- EJS for server-side templates/partials
- Vanilla JS modules for client components
- Lenis + Anime.js via CDN
- Simple in-memory / JSON data (SQLite-ready later)

This document is the source of truth for how the system should be structured.

---

## 1. High-Level Overview

- Server:
  - Bun + Hono app responsible for:
    - Serving HTML via EJS templates
    - Serving static assets under `/static/...`
    - Providing JSON APIs for products/cart/admin
- Views:
  - EJS templates compose:
    - Layout
    - Page sections (hero, products grid, cart)
    - Data from server (e.g., list of products)
- Client:
  - Small runtime:
    - `BaseComponent` class
    - `ComponentRegistry`
    - `ProgressiveHydrator`
    - `EventBus` + `CartStore`
    - Concrete components: `Hero`, `ProductCard`, `ProductGrid`, `CartModal`
  - Components are standard ES modules mounted/hydrated based on `data-component` + `data-props`.

Design goals:

- Explicit module boundaries.
- No hidden magic, no big framework.
- Easy to move between SSR-only, CSR-only, or hybrid.

---

## 2. Project Structure (Authoritative)

```text
/
├─ server.js
├─ package.json
├─ bunfig.toml                # optional; Bun-specific settings
├─ src/
│  └─ db/
│     └─ schema.sql           # future SQLite schema
└─ public/
   ├─ index.ejs               # storefront page
   ├─ admin.ejs               # admin dashboard
   ├─ main.css                # main UI styles
   ├─ admin.css               # admin styles
   ├─ images/                 # product / UI assets
   └─ js/
      ├─ utils/
      │  ├─ BaseComponent.js
      │  ├─ ComponentRegistry.js
      │  ├─ ProgressiveHydrator.js
      │  ├─ EventBus.js
      │  ├─ CartStore.js
      │  └─ scroll.js         # Lenis + Anime helpers
      ├─ components/
      │  ├─ Hero.js
      │  ├─ ProductCard.js
      │  ├─ ProductGrid.js
      │  └─ CartModal.js
      └─ canvas/              # any canvas-specific modules (optional)
```

Routing rule: everything the browser imports must live under `public` and be served via `/static/...`.

---

## 3. Server: Hono + Bun

### 3.1 Static Routes

Single source of truth:

- `/static/main.css` → `public/main.css`
- `/static/admin.css` → `public/admin.css`
- `/static/images/...` → `public/images/...`
- `/static/js/...` → `public/js/...`

Implementation (conceptual):

```js
app.use('/static/main.css', serveStatic({ root: './public', path: '/main.css' }));
app.use('/static/admin.css', serveStatic({ root: './public', path: '/admin.css' }));
app.use('/static/images/*', serveStatic({ root: './public/images' }));
app.use('/static/js/*', serveStatic({ root: './public/js' }));
```

Rule: URLs and filesystem must mirror:

- File: `public/js/utils/ComponentRegistry.js`
- URL: `/static/js/utils/ComponentRegistry.js`

No other magic.

### 3.2 HTML Routes

- `GET /`
  - Reads products from in-memory array or DB.
  - Renders [`public/index.ejs`](public/index.ejs) with `{ products }`.
- `GET /admin`
  - Renders [`public/admin.ejs`](public/admin.ejs) with `{ products }`.

### 3.3 API Routes

- `/api/products` CRUD (backed by memory or SQLite later).
- `/api/cart` simple JSON cart (in memory or via `CartStore` server-side equivalent if needed).

---

## 4. EJS View Contracts

### 4.1 index.ejs

Responsibilities:

- Include CSS and fonts.
- Output semantic structure only.
- Provide hydration hints via `data-*` attributes.

Key patterns:

- Link styles:

  ```html
  <link rel="stylesheet" href="/static/main.css">
  ```

- Hero:

  ```html
  <section
    class="hero-section"
    id="hero"
    data-component="Hero"
    data-props='{"title":"Luxury Sunglasses","subtitle":"Experience the difference","ctaText":"Shop Now"}'>
    ...
  </section>
  ```

- Product grid:

  ```html
  <div
    class="products-grid"
    id="productsGrid"
    data-component="ProductGrid"
    data-props='<%= JSON.stringify({ products }) %>'>
  </div>
  ```

- Cart modal container:

  ```html
  <div id="cartRoot" data-component="CartModal"></div>
  ```

- Boot script (ESM):

  ```html
  <script type="module">
    import { componentRegistry } from '/static/js/utils/ComponentRegistry.js';
    import { hydrator } from '/static/js/utils/ProgressiveHydrator.js';
    import { eventBus } from '/static/js/utils/EventBus.js';
    import { cartStore } from '/static/js/utils/CartStore.js';
    import { smoothScroll, animationManager } from '/static/js/utils/scroll.js';

    import Hero from '/static/js/components/Hero.js';
    import ProductCard from '/static/js/components/ProductCard.js';
    import ProductGrid from '/static/js/components/ProductGrid.js';
    import CartModal from '/static/js/components/CartModal.js';

    componentRegistry.register('Hero', Hero);
    componentRegistry.register('ProductCard', ProductCard);
    componentRegistry.register('ProductGrid', ProductGrid);
    componentRegistry.register('CartModal', CartModal);

    hydrator.init();
    window.addEventListener('load', () => {
      hydrator.hydrateAll();
    });

    eventBus.on('cart:changed', () => {
      // update cart badge / modal
    });
  </script>
  ```

No inline EJS in JS expressions (except safe JSON in data attributes).

---

## 5. Client Runtime

### 5.1 BaseComponent

[`public/js/utils/BaseComponent.js`](public/js/utils/BaseComponent.js)

- Provides:
  - `mount(container)`
  - `hydrate(element)`
  - `setProps`, `setState`
  - lifecycle hooks:
    - `onBeforeMount`, `onMounted`
    - `onBeforeUpdate`, `onUpdated`
    - `onBeforeUnmount`, `onUnmounted`
- All UI components extend this.

### 5.2 Component Registry

[`public/js/utils/ComponentRegistry.js`](public/js/utils/ComponentRegistry.js)

- Map `name -> class`.
- Used by hydrator to instantiate from `data-component`.

### 5.3 ProgressiveHydrator

[`public/js/utils/ProgressiveHydrator.js`](public/js/utils/ProgressiveHydrator.js)

- Scans for `[data-component]:not([data-hydrated])`.
- Uses IntersectionObserver / priority to:
  - import module (already loaded in our case).
  - call `new Component(props).hydrate(element)`.

### 5.4 EventBus + CartStore

[`public/js/utils/EventBus.js`](public/js/utils/EventBus.js)
[`public/js/utils/CartStore.js`](public/js/utils/CartStore.js)

- Global event bus for decoupled communication.
- CartStore:
  - Keeps items in memory + `localStorage`.
  - Emits `cart:changed` events.

### 5.5 scroll.js

[`public/js/utils/scroll.js`](public/js/utils/scroll.js)

- Wraps Lenis + Anime.js from CDN.
- Provides:
  - `smoothScroll` instance
  - `animationManager` utilities (fadeIn, slideIn, stagger, etc.)

---

## 6. Components

Each under `public/js/components`, all ESM, all extend `BaseComponent`.

- `Hero.js`
  - Uses canvas + `scroll.js` animations.
  - Reacts to mouse for lens/particle effects.
- `ProductCard.js`
  - Renders single product.
  - Uses Anime.js hover effects.
  - Emits `cart:add` via EventBus.
- `ProductGrid.js`
  - Accepts `{ products }` via `data-props`.
  - Renders collection of `ProductCard`s.
- `CartModal.js`
  - Subscribes to `cart:changed`.
  - Renders live cart UI.

Hydration flow: server prints skeleton markup + `data-*`; client bootstraps minimal JS.

---

## 7. Debugging Static 404s (What To Check)

When 404s appear for `/static/js/...`:

Checklist:

1. File exists:
   - `public/js/utils/ComponentRegistry.js`
2. Route:
   - `app.use('/static/js/*', serveStatic({ root: './public/js' }));`
3. URL:
   - Import uses `/static/js/utils/ComponentRegistry.js`
4. No extra `/styles` or old paths.
5. Restart server after route changes.

If all 1–4 true and still 404, log a test:

```js
app.get('/debug/static', c => c.json({ cwd: process.cwd(), files: fs.readdirSync('./public/js') }));
```

But under normal conditions, the configuration above is sufficient.

---

## 8. Phased Implementation

1. Phase 1 — Static prototype
   - Hard-coded products array
   - Working CSS + JS routing
   - Hero, ProductGrid, CartModal wired
2. Phase 2 — Data backend
   - Swap in SQLite via `better-sqlite3` or Bun SQLite
   - Implement full CRUD for `/api/products`
3. Phase 3 — Modularization
   - Extract component runtime as reusable mini-library
4. Phase 4 — Admin + testing
   - Admin UI built on same component system
   - Add tests and Lighthouse/perf checks

---

## 9. How To Use This Doc

- Treat as contract:
  - If console shows `/static/...` 404, fix either:
    - `serveStatic` route
    - or file location
    - or import URL
  - Do not mix EJS `<%=` inside JS expressions; pass JSON via `data-props`.
- This architecture is reusable for other small Bun+Hono+EJS projects.
