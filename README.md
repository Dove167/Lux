# Lux

Lux is a small, opinionated web framework for building modern, animated, server-first sites without React-sized overhead.

It is designed for one job:

- Build fast, beautiful, maintainable sites (especially for real businesses) in hours, not weeks.

Lux is not a new language or a mega runtime. It is a thin, concrete architecture built entirely on web standards:

- Bun + Hono for HTTP and routing
- EJS for server-side templates
- Vanilla ES modules for client components
- A minimal runtime for hydration, state, and events

If you know HTML, CSS, and JavaScript, you can read and extend Lux in an afternoon.

---

## Why Lux?

Most frameworks are built to solve the hardest problems for the biggest apps.

Lux is not.

Lux is for the 80% of projects that need:

- Server-rendered pages (SEO, instant paint)
- A few rich interactive components (hero, cards, cart, forms)
- Great performance on mobile
- A codebase that isn't hostile to future you

Without:

- Shipping 300kb of framework to render static content
- Complex build pipelines and lock-in
- Framework churn every 2–3 years

### Design Principles

1. **Server-first**

   - Hono + EJS render real HTML.
   - Pages work with JavaScript disabled.
   - JS is used to enhance, not to exist.

2. **Islands & Progressive Hydration**

   - Components opt in via `data-component` and `data-props`.
   - The `ProgressiveHydrator` hydrates only what needs behavior.
   - You control when/where hydration happens.

3. **Standards Native**

   - No JSX.
   - No virtual DOM.
   - Just ES modules, DOM APIs, and HTML templates.

4. **Disciplined State**

   - Shared state lives in focused stores (e.g. `CartStore`).
   - Communication via a small `EventBus` with namespaced events.
   - Unidirectional flow: components emit intents → stores update → stores emit changes.

5. **Production-Friendly**

   - Built on Bun & Hono (fast, simple).
   - Easy to deploy anywhere you can run a Bun process.
   - Architecture documented in [`lux-modular-ui-architecture.md`](lux-modular-ui-architecture.md).

---

## What Lux Gives You

Lux is made of a few small, explicit building blocks.

### 1. Server (Hono + EJS)

- [`server.js`](server.js)
  - Defines routes:
    - `GET /` → [`public/index.ejs`](public/index.ejs)
    - `GET /admin` → [`public/admin.ejs`](public/admin.ejs)
    - `/api/products`, `/api/cart` → JSON APIs
  - Serves everything in `public/` directly (`/main.css`, `/js/...`, `/images/...`).

- EJS templates:
  - Output semantic HTML.
  - Mark interactive regions:

    ```html
    <section
      class="hero-section"
      data-component="Hero"
      data-props='{"title":"Luxury Sunglasses","subtitle":"Experience the difference"}'>
      ...
    </section>
    ```

### 2. Client Runtime

Located under `public/js/utils`:

- [`BaseComponent`](public/js/utils/BaseComponent.js)
  - Tiny class with lifecycle hooks and DOM helpers.
  - All interactive components extend this.

- [`ComponentRegistry`](public/js/utils/ComponentRegistry.js)
  - Maps names (`"Hero"`, `"ProductCard"`) to component classes.
  - Central place to see what components exist.

- [`ProgressiveHydrator`](public/js/utils/ProgressiveHydrator.js)
  - Scans for `[data-component]`.
  - Hydrates components progressively.
  - Enables islands-style behavior without a large runtime.

- [`EventBus`](public/js/utils/EventBus.js)
  - Simple pub/sub with middlewares.
  - Used as a transport, not a dumping ground.

- [`CartStore`](public/js/utils/CartStore.js)
  - Example of a domain store:
    - Owns cart state.
    - Listens to `cart:*` events.
    - Emits `cart:changed` snapshots.
  - Demonstrates how Lux avoids event-driven spaghetti.

- [`scroll.js`](public/js/utils/scroll.js)
  - Integrates Lenis + Anime.js (via CDNs) for:
    - smooth scrolling
    - reusable animation utilities

### 3. Components

Located under `public/js/components`:

- `Hero.js`
  - Canvas/animation-enhanced hero.
  - Hydrates from server markup.

- `ProductCard.js`
- `ProductGrid.js`
- `CartModal.js`
  - Example interactive components using:
    - `BaseComponent`
    - `EventBus`
    - `CartStore`
    - `AnimationManager`

These show the Lux pattern:

- HTML from server
- `data-*` props
- client class enhances behavior via the runtime

---

## How Lux Differs From Other Stacks

- **vs JSX/React**
  - No JSX, no VDOM.
  - Components are HTML + JS classes.
  - Hydration is opt-in per island, not entire tree re-renders.

- **vs Next.js**
  - No meta-framework complexity.
  - Routing is explicit via Hono.
  - Designed for fast SSR sites and targeted interactivity, not for every app in existence.

- **vs Vue**
  - No custom template syntax or reactive engine.
  - Uses the platform directly.

- **vs Vite**
  - Vite is a bundler/dev server.
  - Lux is an architecture.
  - You can layer Vite under Lux if/when you need bundling, but it’s not required.

Lux is intentionally smaller in scope:
- It is a framework for building server-first, animated, componentized sites on web standards.

---

## Getting Started (Conceptual)

1. Install deps

   ```bash
   bun install
   ```

2. Run dev server

   ```bash
   bun run dev
   ```

3. Visit

   - `http://localhost:3000` → storefront demo
   - `http://localhost:3000/admin` → admin scaffold (when implemented)

4. Add a new component

   - Create `public/js/components/MyComponent.js` extending `BaseComponent`.
   - Register it in the boot script (e.g. in `index.ejs`) using `ComponentRegistry`.
   - Add markup with `data-component="MyComponent"`.

---

## When to Use Lux

Use Lux if:

- You are building:
  - marketing sites
  - portfolios
  - landing pages
  - product pages
  - small commerce/frontends with server APIs
- You care about:
  - load time, SEO, and accessibility
  - modern animations and polish
  - code that you can hand to any JS dev

Do not use Lux if:

- You are building:
  - huge SPAs with highly dynamic client-side routing
  - complex internal tools with deep reactive state needs
- In that world, React/Vue/etc. are a better fit.

---

## Project Status

This repository includes:

- Working Lux runtime
- Example Lux storefront (Lux Sunglasses)
- Architecture docs:
  - [`lux-modular-ui-architecture.md`](lux-modular-ui-architecture.md)
  - [`lux-next-todos-and-docs.md`](lux-next-todos-and-docs.md)

Planned:

- Lenis integration polish
- More reusable components/sections
- Admin CRUD UI
- SQLite-backed products
- Tests and performance metrics
- CLI / scaffolding for rapid site generation

Lux is intentionally small, explicit, and evolving in real projects—not theoretical.
