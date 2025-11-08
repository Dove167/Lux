 // LuxPrimitives.js
 // Pure Lux implementations for core Lux primitives:
 // - LuxNav, LuxButton, LuxCard, LuxToast
 // - LuxDialog, LuxTabs, LuxDropdown, LuxTable, LuxSkeleton
 // All extend BaseComponent and are wired via data-component + ComponentRegistry.

 import { BaseComponent } from '/js/utils/BaseComponent.js';
 import { eventBus } from '/js/utils/EventBus.js';

/**
 * LuxNav
 * - Enhances existing .navbar markup.
 * - Adds scroll shadow + active link highlight.
 * - Optionally listens to cart:changed for badge (index.ejs/components.ejs already wire cartStore).
 *
 * Usage (SSR):
 * <nav class="navbar" data-component="LuxNav" data-props='{"active":"components"}'>...</nav>
 */
export class LuxNav extends BaseComponent {
  onMounted() {
    this.setupScrollShadow();
    this.markActiveLink();
  }

  setupScrollShadow() {
    const nav = this.element;
    if (!nav) return;

    const onScroll = () => {
      if (window.scrollY > 8) {
        nav.classList.add('navbar-scrolled');
      } else {
        nav.classList.remove('navbar-scrolled');
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this._onScroll = onScroll;
  }

  markActiveLink() {
    const active = this.props?.active;
    if (!active) return;

    const links = this.element.querySelectorAll('.nav-link');
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const key =
        href === '/'
          ? 'storefront'
          : href.replace('/', '').toLowerCase();
      if (
        (active === 'components' && href === '/components') ||
        (active === 'admin' && href === '/admin') ||
        (active === 'storefront' && href === '/')
      ) {
        link.classList.add('nav-link-active');
      } else if (link.classList.contains('nav-link-active') && key !== active) {
        link.classList.remove('nav-link-active');
      }
    });
  }

  onBeforeUnmount() {
    if (this._onScroll) {
      window.removeEventListener('scroll', this._onScroll);
    }
  }
}

/**
 * LuxButton
 * - Visual/behavioral wrapper for .lux-btn.
 * - Variants: primary, outline, ghost.
 *
 * Usage:
 * <button data-component="LuxButton"
 *         data-props='{"variant":"primary","label":"Buy Now","size":"md"}'>
 *   Buy Now
 * </button>
 */
export class LuxButton extends BaseComponent {
  onMounted() {
    const btn = this.element;
    if (!btn) return;

    const { variant = 'primary', size = 'md', label } = this.props || {};

    // Base classes (rely on existing .hero-cta / .add-to-cart-btn styles where needed)
    btn.classList.add('lux-btn');
    btn.classList.remove('lux-btn-loading');

    if (variant === 'outline') btn.classList.add('lux-btn-outline');
    if (variant === 'ghost') btn.classList.add('lux-btn-ghost');

    if (size === 'sm') btn.classList.add('lux-btn-sm');
    if (size === 'lg') btn.classList.add('lux-btn-lg');

    if (label && !btn.dataset.lockLabel) {
      btn.textContent = label;
    }

    // Simple micro-interaction using Anime.js if available
    btn.addEventListener('click', () => {
      if (window.anime) {
        window.anime({
          targets: btn,
          scale: [1, 0.96, 1],
          duration: 180,
          easing: 'easeOutQuad'
        });
      }
    });
  }
}

/**
 * LuxCard
 * - Generic card shell. Reads props for title/body/tag.
 * - Adds subtle hover motion via Anime.js if present.
 *
 * Usage:
 * <div data-component="LuxCard"
 *      data-props='{"title":"Aurora Frame","body":"Ultra-light.", "tag":"Featured"}'>
 *   <!-- SSR fallback content is allowed; JS enhances -->
 * </div>
 */
export class LuxCard extends BaseComponent {
  onMounted() {
    const el = this.element;
    if (!el) return;

    el.classList.add('lux-card');

    const { title, subtitle, body, tag } = this.props || {};

    const inner =
      el.querySelector('.lux-card-inner') ||
      el.appendChild(document.createElement('div'));
    inner.classList.add('lux-card-inner');

    if (tag) {
      let tagEl = el.querySelector('.lux-card-tag');
      if (!tagEl) {
        tagEl = document.createElement('div');
        tagEl.className = 'lux-card-tag';
        inner.prepend(tagEl);
      }
      tagEl.textContent = tag;
    }

    if (title) {
      let t = el.querySelector('.lux-card-title');
      if (!t) {
        t = document.createElement('h3');
        t.className = 'lux-card-title';
        inner.appendChild(t);
      }
      t.textContent = title;
    }

    if (subtitle) {
      let st = el.querySelector('.lux-card-subtitle');
      if (!st) {
        st = document.createElement('p');
        st.className = 'lux-card-subtitle';
        inner.appendChild(st);
      }
      st.textContent = subtitle;
    }

    if (body) {
      let b = el.querySelector('.lux-card-body');
      if (!b) {
        b = document.createElement('p');
        b.className = 'lux-card-body';
        inner.appendChild(b);
      }
      b.textContent = body;
    }

    // Hover micro-motion
    el.addEventListener('mouseenter', () => {
      if (window.anime) {
        window.anime({
          targets: el,
          translateY: -4,
          boxShadow: ['0 18px 48px rgba(0,0,0,0.12)', '0 28px 72px rgba(0,0,0,0.18)'],
          duration: 220,
          easing: 'easeOutQuad'
        });
      } else {
        el.style.transform = 'translateY(-2px)';
      }
    });

    el.addEventListener('mouseleave', () => {
      if (window.anime) {
        window.anime({
          targets: el,
          translateY: 0,
          boxShadow: ['0 28px 72px rgba(0,0,0,0.18)', '0 18px 48px rgba(0,0,0,0.12)'],
          duration: 220,
          easing: 'easeOutQuad'
        });
      } else {
        el.style.transform = 'translateY(0)';
      }
    });
  }
}

/**
 * LuxToast
 * - Listens on EventBus for `toast` events and renders stack of toasts.
 * - Usage:
 *   <div id="lux-toast-root" data-component="LuxToast"></div>
 *   eventBus.emit('toast', { type: 'success', message: 'Added to cart' });
 */
export class LuxToast extends BaseComponent {
  onMounted() {
    this.element.classList.add('lux-toast-root');
    this.toasts = [];
    eventBus.on('toast', (payload) => this.showToast(payload));
  }

  showToast({ type = 'info', message = '' } = {}) {
    if (!message) return;

    const toast = document.createElement('div');
    toast.className = `lux-toast lux-toast-${type}`;
    toast.textContent = message;

    this.element.appendChild(toast);
    this.toasts.push(toast);

    if (window.anime) {
      window.anime({
        targets: toast,
        translateY: [16, 0],
        opacity: [0, 1],
        duration: 220,
        easing: 'easeOutQuad'
      });
    }

    setTimeout(() => {
      if (window.anime) {
        window.anime({
          targets: toast,
          translateY: [0, -8],
          opacity: [1, 0],
          duration: 200,
          easing: 'easeInQuad',
          complete: () => toast.remove()
        });
      } else {
        toast.remove();
      }
    }, 2600);
  }
}

/**
 * LuxDialog
 * - SSR-friendly modal dialog.
 * - Usage:
 *   <div data-component="LuxDialog"
 *        data-props='{"triggerId":"openLuxDialog","title":"Lux Dialog","body":"Content"}'></div>
 *   <button id="openLuxDialog">Open</button>
 */
export class LuxDialog extends BaseComponent {
  onMounted() {
    const { triggerId, title = 'Lux Dialog', body = '' } = this.props || {};
    this.isOpen = false;

    this.overlay = document.createElement('div');
    this.overlay.className = 'lux-dialog-overlay';

    this.content = document.createElement('div');
    this.content.className = 'lux-dialog';

    this.content.innerHTML = `
      <div class="lux-dialog-header">
        <h3 class="lux-dialog-title">${title}</h3>
        <button class="lux-dialog-close">&times;</button>
      </div>
      <div class="lux-dialog-body">${body}</div>
      <div class="lux-dialog-footer">
        <button class="lux-btn lux-btn-sm lux-dialog-close-btn">Close</button>
      </div>
    `;

    this.overlay.appendChild(this.content);
    document.body.appendChild(this.overlay);

    const open = () => this.open();
    const trigger = triggerId ? document.getElementById(triggerId) : null;
    if (trigger) trigger.addEventListener('click', open);
    this._openHandler = open;

    const closeButtons = this.content.querySelectorAll('.lux-dialog-close, .lux-dialog-close-btn');
    closeButtons.forEach((btn) =>
      btn.addEventListener('click', () => this.close())
    );
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.overlay.classList.add('lux-dialog-open');
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.overlay.classList.remove('lux-dialog-open');
  }

  onBeforeUnmount() {
    if (this.overlay?.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}

/**
 * LuxTabs
 * - Minimal tabs system.
 * - Markup:
 *   <div data-component="LuxTabs">
 *     <div class="lux-tabs-list">
 *       <button data-tab="details">Details</button>
 *       <button data-tab="specs">Specs</button>
 *     </div>
 *     <div class="lux-tabs-panel" data-panel="details">...</div>
 *     <div class="lux-tabs-panel" data-panel="specs">...</div>
 *   </div>
 */
export class LuxTabs extends BaseComponent {
  onMounted() {
    const root = this.element;
    this.active = this.props?.active || null;

    this.triggers = Array.from(
      root.querySelectorAll('[data-tab]')
    );
    this.panels = Array.from(
      root.querySelectorAll('[data-panel]')
    );

    if (!this.active && this.triggers.length) {
      this.active = this.triggers[0].dataset.tab;
    }

    this.triggers.forEach((btn) => {
      btn.classList.add('lux-tabs-trigger');
      btn.addEventListener('click', () =>
        this.setActive(btn.dataset.tab)
      );
    });

    this.panels.forEach((panel) =>
      panel.classList.add('lux-tabs-panel')
    );

    this.setActive(this.active);
  }

  setActive(id) {
    if (!id) return;
    this.active = id;

    this.triggers.forEach((btn) => {
      const isActive = btn.dataset.tab === id;
      btn.classList.toggle('lux-tabs-trigger-active', isActive);
    });

    this.panels.forEach((panel) => {
      const isActive = panel.dataset.panel === id;
      panel.classList.toggle('lux-tabs-panel-active', isActive);
    });
  }
}

/**
 * LuxDropdown
 * - Simple anchored dropdown.
 * - Markup:
 *   <div data-component="LuxDropdown" class="lux-dropdown">
 *     <button class="lux-btn-sm" data-dropdown-trigger>Menu</button>
 *     <div class="lux-dropdown-menu">
 *       <a href="#">Item</a>
 *     </div>
 *   </div>
 */
export class LuxDropdown extends BaseComponent {
  onMounted() {
    const trigger = this.element.querySelector('[data-dropdown-trigger]');
    const menu = this.element.querySelector('.lux-dropdown-menu');
    if (!trigger || !menu) return;

    const toggle = () => {
      menu.classList.toggle('lux-dropdown-open');
    };
    const close = (e) => {
      if (!this.element.contains(e.target)) {
        menu.classList.remove('lux-dropdown-open');
      }
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });
    document.addEventListener('click', close);

    this._cleanup = () => {
      document.removeEventListener('click', close);
    };
  }

  onBeforeUnmount() {
    if (this._cleanup) this._cleanup();
  }
}

/**
 * LuxTable
 * - Sortable, minimal table.
 * - Markup:
 *   <table data-component="LuxTable">
 *     <thead>
 *       <tr>
 *         <th data-sort-key="name">Name</th>
 *       </tr>
 *     </thead>
 *     <tbody>...</tbody>
 *   </table>
 */
export class LuxTable extends BaseComponent {
  onMounted() {
    this.tbody = this.element.querySelector('tbody');
    if (!this.tbody) return;

    this.rows = Array.from(this.tbody.querySelectorAll('tr'));
    const headers = this.element.querySelectorAll('th[data-sort-key]');
    headers.forEach((th) => {
      th.classList.add('lux-table-sortable');
      th.addEventListener('click', () =>
        this.sortBy(th.dataset.sortKey, th)
      );
    });
  }

  sortBy(key, headerEl) {
    if (!key || !this.rows.length) return;
    const idx = Array.from(headerEl.parentNode.children).indexOf(headerEl);
    const dir =
      headerEl.dataset.sortDir === 'asc' ? 'desc' : 'asc';
    headerEl.dataset.sortDir = dir;

    this.rows.sort((a, b) => {
      const av = a.children[idx].textContent.trim();
      const bv = b.children[idx].textContent.trim();
      if (!isNaN(parseFloat(av)) && !isNaN(parseFloat(bv))) {
        return dir === 'asc'
          ? parseFloat(av) - parseFloat(bv)
          : parseFloat(bv) - parseFloat(av);
      }
      return dir === 'asc'
        ? av.localeCompare(bv)
        : bv.localeCompare(av);
    });

    this.tbody.innerHTML = '';
    this.rows.forEach((r) => this.tbody.appendChild(r));
  }
}

/**
 * LuxSkeleton
 * - Shimmer placeholder wrapper.
 * - Markup:
 *   <div data-component="LuxSkeleton" class="lux-skeleton" data-props='{"lines":3}'></div>
 */
export class LuxSkeleton extends BaseComponent {
  onMounted() {
    const { lines = 3 } = this.props || {};
    const count = Math.max(1, Math.min(parseInt(lines, 10) || 3, 8));
    this.element.classList.add('lux-skeleton');
    this.element.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const line = document.createElement('div');
      line.className = 'lux-skeleton-line';
      if (i === count - 1) {
        line.classList.add('lux-skeleton-line-short');
      }
      this.element.appendChild(line);
    }
  }
}

export default {
  LuxNav,
  LuxButton,
  LuxCard,
  LuxToast,
  LuxDialog,
  LuxTabs,
  LuxDropdown,
  LuxTable,
  LuxSkeleton
};