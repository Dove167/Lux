// LuxPrimitives.js
// Pure Lux implementations for LuxNav, LuxButton, LuxCard, LuxToast
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

export default {
  LuxNav,
  LuxButton,
  LuxCard,
  LuxToast
};