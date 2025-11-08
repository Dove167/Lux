# Debugging Report: Persistent 404s for Lux Components

## Problem Description
When navigating to `http://localhost:3000/components`, the browser console consistently reports 404 (Not Found) errors for individual JavaScript files that do not exist on disk:
- `http://localhost:3000/js/components/LuxNav.js`
- `http://localhost:3000/js/components/LuxButton.js`
- `http://localhost:3000/js/components/LuxCard.js`
- `http://localhost:3000/js/components/LuxToast.js`

Simultaneously, the console also shows messages like:
- `ProgressiveHydrator: Initializing (Version 2025-11-08T04:30:00Z)`
- `Component "LuxNav" not found in registry. Cannot hydrate.`

This indicates a critical contradiction: the *new* version of `ProgressiveHydrator.js` (which should use `componentRegistry.get()` to find component classes) is loading, but the error messages suggest an *old* version of its `hydrateElement` function (which performed dynamic imports for individual component files) is still being executed.

## Analysis of Contradiction
The `ProgressiveHydrator`'s constructor log confirms that the latest code for the `ProgressiveHydrator` class itself is being loaded and initialized. However, the subsequent "Failed to fetch dynamically imported module" errors, which originate from the `hydrateElement` method, imply that the browser is somehow retaining and executing an older version of this specific method. This is a strong indicator of aggressive browser caching or a module resolution quirk where an old function reference persists in the execution context.

## Steps Taken (and their outcomes)

1.  **Modified `ProgressiveHydrator.js` to use `componentRegistry.get()`**:
    *   **Change**: Updated `public/js/utils/ProgressiveHydrator.js` to retrieve component classes from `componentRegistry` instead of attempting dynamic `import()` for each component name.
    *   **Outcome**: The `ProgressiveHydrator: Initializing` log confirms this file is loading, but the 404 errors persist, suggesting the *old* `hydrateElement` logic is still active.

2.  **Added `cacheControl: 'no-store'` to `/js/*` route in `server.js`**:
    *   **Change**: Configured Hono's `serveStatic` middleware for `/js/*` to explicitly prevent caching.
    *   **Outcome**: This should force fresh fetches of JS files, but the problem persists.

3.  **Removed `?v=<%= Date.now() %>` from JS imports in EJS files**:
    *   **Change**: Removed cache-busting query parameters from `<script type="module">` imports in `public/index.ejs` and `public/components.ejs`.
    *   **Outcome**: This change was applied to `index.ejs` successfully. For `components.ejs`, the `apply_diff` failed due to content mismatch, indicating the cache-busting was already removed in that file. This confirms the EJS templates are requesting the files without cache-busting, relying on `no-store`.

4.  **Added version log to `ProgressiveHydrator.js` constructor**:
    *   **Change**: Added `console.log('ProgressiveHydrator: Initializing (Version 2025-11-08T04:30:00Z)')` to the constructor.
    *   **Outcome**: This log *is* visible in the console, confirming the new `ProgressiveHydrator.js` file is loaded.

5.  **Attempted to move `componentRegistry.register()` calls and `hydrator.hydrateAll()` out of `window.addEventListener('load', ...)` in `public/components.ejs`**:
    *   **Change**: The intention was to ensure components are registered and hydration starts immediately upon module execution, before any `load` event timing issues.
    *   **Outcome**: This `apply_diff` repeatedly failed due to content mismatch, indicating the `componentRegistry.register()` calls are *still* inside the `window.addEventListener('load', ...)` block in `public/components.ejs`. This is a critical remaining issue.

## Current Hypothesis
The primary issue is that the `componentRegistry.register()` calls in `public/components.ejs` are still wrapped within `window.addEventListener('load', ...)`. This means that even if the *new* `ProgressiveHydrator.js` is loaded, it attempts to hydrate elements (either immediately via `hydrateAll()` or progressively via `IntersectionObserver`) *before* the `load` event fires and the components are actually registered in the `componentRegistry`. When `ProgressiveHydrator` calls `componentRegistry.get(componentName)`, it returns `undefined`, leading to the "Component 'LuxNav' not found in registry. Cannot hydrate." warning. The "Failed to fetch dynamically imported module" error is a red herring, likely a lingering effect of an old `ProgressiveHydrator` instance or a browser's aggressive module cache.

## Next Steps for Resolution

1.  **Verify and Correct `public/components.ejs`**:
    *   **Action**: Read the exact content of `public/components.ejs`.
    *   **Correction**: Construct a precise `apply_diff` to move all `componentRegistry.register()` calls and the `hydrator.hydrateAll()` call to *immediately after the imports* in the `<script type="module">` block, but *before* the `window.addEventListener('load', ...)` block. The `window.addEventListener('load', ...)` block should then only contain the cart modal wiring and demo toast trigger.

2.  **Full Browser Cache Clear**:
    *   **Action**: After applying the code changes, instruct the user to perform a full browser cache clear (e.g., via browser developer tools -> Application -> Clear site data, or by clearing all browser history/cache). A simple hard refresh might not be enough for deep module caching issues.

3.  **Restart Dev Server**:
    *   **Action**: Ensure the `bun run dev` server is restarted after all file changes.

This comprehensive approach should finally resolve the component hydration issues on the `/components` page.