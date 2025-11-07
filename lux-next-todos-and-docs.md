# Lux Modular UI — Remaining TODOs + Docs Map

Now that routing, CSS, and core hydration are stable, these are the focused next steps and which docs (via Context7) to lean on.

---

## 1. Lenis Smooth Scrolling Integration

Status: Pending

Goals:
- Initialize Lenis in `public/js/utils/scroll.js`.
- Ensure it drives the main scroll loop without fighting browser defaults.
- Hook into sections (hero → products) for smooth jumps.

Key Tasks:
- Wire `SmoothScroll` to real Lenis instance (already scaffolded).
- Use `smoothScroll.scrollTo('#products')` on Hero CTA.
- Verify performance and that component hydration still behaves.

Docs:
- Lenis: `/darkroomengineering/lenis`
- Bun runtime basics (for ESM + DOM in browser): `/websites/bun_sh`

---

## 2. Anime.js Animations

Status: Pending

Goals:
- Use Anime.js for:
  - Hero intro (titles, CTA).
  - Product cards hover/entrance.
  - Micro-interactions (cart icon, modal).

Key Tasks:
- Centralize effects in `scroll.js` `AnimationManager`.
- Use it in:
  - `Hero.js` for entrance + subtle float.
  - `ProductCard.js` for hover + add-to-cart feedback.
- Keep animations progressive-enhancement (no JS = still usable).

Docs:
- Anime.js: `/juliangarnier/anime` or `/websites/animejs`
- Pattern references: same Anime docs + examples.

---

## 3. ProductGrid + Cart UX Polish

Status: Partial

Goals:
- Ensure `ProductGrid` renders from server-provided `data-props`.
- Double-check `CartStore` + `EventBus` integration with UI.

Key Tasks:
- Confirm:
  - Clicking "Add to Cart" emits `cart:add`.
  - `CartStore` updates `cart-count` and modal contents.
- Add visual feedback (Anime.js) and error handling.

Docs:
- Internal only (your own [`lux-modular-ui-architecture.md`](lux-modular-ui-architecture.md)).
- Hono docs (for any API tweaks): `/llmstxt/hono_dev_llms-full_txt`.

---

## 4. Admin CRUD Interface

Status: Pending

Goals:
- Admin UI (EJS + modular components) for managing products.

Key Tasks:
- `public/admin.ejs`:
  - Table/list of products.
  - Create/Update/Delete forms.
- Hono routes:
  - `/admin` GET (render).
  - `/api/products` POST/PUT/DELETE (already scaffolded; harden/validate).
- Use same component system for reusable admin widgets.

Docs:
- Hono routing & middleware: `/llmstxt/hono_dev_llms-full_txt`
- Bun + fetch/JSON handling: `/websites/bun_sh`

---

## 5. SQLite Persistence (Optional Upgrade)

Status: Planned (schema exists)

Goals:
- Replace in-memory products with SQLite (or Bun’s SQLite).

Key Tasks:
- Implement DB init from [`src/db/schema.sql`](src/db/schema.sql).
- Wrap queries in small data-access module.
- Swap product CRUD to DB-backed.

Docs:
- Bun + SQLite patterns: `/websites/bun_sh`
- (If using better-sqlite3 or Bun.sqlite: follow Bun docs; not in current deps map.)

---

## 6. Progressive Hydration Refinement

Status: Core works (Hero, ProductGrid hydrated)

Goals:
- Ensure hydrator is efficient, predictable, and debuggable.

Key Tasks:
- Add priority rules (hero immediate, grid on viewport).
- Emit hydration metrics via `EventBus`.

Docs:
- Internal reference: [`ProgressiveHydrator.js`](public/js/utils/ProgressiveHydrator.js)
- General guidance: your own architecture docs (no extra external lib).

---

## 7. Testing Strategy

Status: Pending

Goals:
- Confidence in component system, API, and hydration.

Key Tasks:
- Unit tests:
  - ComponentRegistry, EventBus, CartStore (pure logic).
- Integration tests:
  - Hono routes (API + HTML).
- E2E (manual or Playwright) for:
  - Load → hero visible → products appear → cart add.

Docs:
- Bun test runner: `/llmstxt/bun_sh-llms-full_txt` (Bun test docs)
- Hono testing examples: `/llmstxt/hono_dev_llms-full_txt`

---

## 8. Performance + Web Vitals

Status: Pending

Goals:
- Ensure smooth hydration and animations.
- Track basic metrics.

Key Tasks:
- Lightweight metrics module:
  - Track hydration durations, animation frame rates for canvas.
- Log or expose via console during dev.

Docs:
- Bun runtime + browser perf APIs: `/websites/bun_sh` (for env)
- General Web Vitals (external web.dev, not via Context7 id here).

---

## 9. Final Documentation

Status: Pending

Goals:
- Make this system self-explanatory for future you.

Key Tasks:
- Keep [`lux-modular-ui-architecture.md`](lux-modular-ui-architecture.md) in sync.
- Document:
  - Component conventions.
  - Data flow (Server → EJS → data-props → components).
  - How to add new components.

Docs:
- Internal only.
- Optionally reference:
  - Hono + Bun docs for contributors.
  - Lenis + Anime.js docs for animation work.

---

## Summary Checklist (Focused)

- [ ] Integrate Lenis via `scroll.js` and verify smooth scroll.
- [ ] Wire Anime.js animations into Hero + ProductCard cleanly.
- [ ] Finish ProductGrid + Cart interactions with visual feedback.
- [ ] Build Admin CRUD UI using same modular system.
- [ ] (Optional) Switch products API to SQLite per `schema.sql`.
- [ ] Add tests (unit/integration/e2e) using Bun test runner.
- [ ] Add basic perf instrumentation (hydration timing, canvas FPS).
- [ ] Update architecture docs once implementation stabilizes.
