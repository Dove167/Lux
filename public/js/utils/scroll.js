// Lenis smooth scrolling integration
export class SmoothScroll {
  constructor(options = {}) {
    this.lenis = null;
    this.options = {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      ...options
    };
    this.init();
  }

  init() {
    // Check if Lenis is available
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis not found. Make sure to include Lenis script.');
      return;
    }

    this.lenis = new Lenis(this.options);
    this.start();
  }

  start() {
    if (!this.lenis) return;

    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }

  stop() {
    if (this.lenis) {
      this.lenis.stop();
    }
  }

  scrollTo(target, options = {}) {
    if (!this.lenis) return;

    this.lenis.scrollTo(target, options);
  }

  destroy() {
    this.stop();
    this.lenis = null;
  }

  // Get scroll progress (0-1)
  getScrollProgress() {
    if (!this.lenis) return 0;
    return this.lenis.progress;
  }

  // Get current scroll position
  getScrollPosition() {
    if (!this.lenis) return 0;
    return this.lenis.scroll;
  }
}

// Anime.js animation utilities
export class AnimationManager {
  constructor() {
    this.animations = new Map();
  }

  // Fade in animation
  fadeIn(element, duration = 1000, delay = 0) {
    if (typeof anime === 'undefined') {
      console.warn('Anime.js not found. Make sure to include Anime.js script.');
      element.style.opacity = '1';
      return;
    }

    return anime({
      targets: element,
      opacity: [0, 1],
      duration,
      delay,
      easing: 'easeOutCubic'
    });
  }

  // Slide in from direction
  slideIn(element, direction = 'up', distance = 50, duration = 1000, delay = 0) {
    if (typeof anime === 'undefined') {
      console.warn('Anime.js not found. Make sure to include Anime.js script.');
      element.style.opacity = '1';
      element.style.transform = 'translate(0, 0)';
      return;
    }

    const translateProps = {
      up: { value: [distance, 0], property: 'translateY' },
      down: { value: [-distance, 0], property: 'translateY' },
      left: { value: [distance, 0], property: 'translateX' },
      right: { value: [-distance, 0], property: 'translateX' }
    };

    const translate = translateProps[direction] || translateProps.up;

    return anime({
      targets: element,
      opacity: [0, 1],
      [translate.property]: translate.value,
      duration,
      delay,
      easing: 'easeOutCubic'
    });
  }

  // Stagger animation for multiple elements
  staggerIn(elements, direction = 'up', staggerDelay = 100, duration = 800) {
    if (typeof anime === 'undefined') {
      console.warn('Anime.js not found. Make sure to include Anime.js script.');
      elements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translate(0, 0)';
      });
      return;
    }

    return anime({
      targets: elements,
      opacity: [0, 1],
      translateY: direction === 'up' ? [50, 0] : direction === 'down' ? [-50, 0] : 0,
      translateX: direction === 'left' ? [50, 0] : direction === 'right' ? [-50, 0] : 0,
      duration,
      delay: anime.stagger(staggerDelay),
      easing: 'easeOutCubic'
    });
  }

  // Hover animation
  hoverEffect(element, scale = 1.05, duration = 300) {
    if (typeof anime === 'undefined') {
      console.warn('Anime.js not found. Make sure to include Anime.js script.');
      return;
    }

    let animation;

    element.addEventListener('mouseenter', () => {
      if (animation) animation.pause();
      animation = anime({
        targets: element,
        scale,
        duration,
        easing: 'easeOutCubic'
      });
    });

    element.addEventListener('mouseleave', () => {
      if (animation) animation.pause();
      animation = anime({
        targets: element,
        scale: 1,
        duration,
        easing: 'easeOutCubic'
      });
    });
  }

  // Parallax effect
  parallaxEffect(element, speed = 0.5) {
    if (typeof anime === 'undefined') {
      console.warn('Anime.js not found. Make sure to include Anime.js script.');
      return;
    }

    let lastScrollY = window.scrollY;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      const deltaY = scrollY - lastScrollY;

      anime({
        targets: element,
        translateY: `-=${deltaY * speed}`,
        duration: 0,
        easing: 'linear'
      });

      lastScrollY = scrollY;
      requestAnimationFrame(updateParallax);
    };

    requestAnimationFrame(updateParallax);
  }

  // Stop all animations
  stopAll() {
    if (typeof anime === 'undefined') return;
    anime.remove();
  }

  // Get animation by ID
  get(id) {
    return this.animations.get(id);
  }

  // Set animation by ID
  set(id, animation) {
    this.animations.set(id, animation);
  }

  // Remove animation by ID
  remove(id) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.pause();
      this.animations.delete(id);
    }
  }
}

// Global instances
export const smoothScroll = new SmoothScroll();
export const animationManager = new AnimationManager();