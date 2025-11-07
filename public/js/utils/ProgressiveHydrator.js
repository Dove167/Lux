// Progressive Hydrator for modular UI system
export class ProgressiveHydrator {
  constructor() {
    this.observers = [];
    this.isIntersecting = new WeakMap();
    this.hydrationQueue = [];
    this.isHydrating = false;
  }

  // Initialize intersection observer for progressive hydration
  init() {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported. Progressive hydration disabled.');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    this.observers.push(observer);
    return observer;
  }

  // Handle intersection events
  handleIntersection(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      if (entry.isIntersecting && !this.isIntersecting.get(element)) {
        this.isIntersecting.set(element, true);
        this.hydrateElement(element);
      }
    });
  }

  // Hydrate a specific element
  async hydrateElement(element) {
    const componentName = element.dataset.component;
    const componentId = element.dataset.componentId;
    const componentProps = element.dataset.props ? JSON.parse(element.dataset.props) : {};

    if (!componentName) return;

    try {
      // Dynamically import component
      const module = await import(`../components/${componentName}.js`);
      const ComponentClass = module.default || module[componentName];

      if (ComponentClass) {
        const component = new ComponentClass(componentProps);
        component.hydrate(element);

        // Mark as hydrated
        element.dataset.hydrated = 'true';

        console.log(`Component "${componentName}" hydrated successfully`);
      }
    } catch (error) {
      console.error(`Failed to hydrate component "${componentName}":`, error);
    }
  }

  // Queue element for hydration
  queueForHydration(element) {
    if (!element.dataset.component) return;

    // Add to queue
    this.hydrationQueue.push(element);

    // Start hydration if not already running
    if (!this.isHydrating) {
      this.processHydrationQueue();
    }
  }

  // Process hydration queue
  async processHydrationQueue() {
    if (this.isHydrating || this.hydrationQueue.length === 0) return;

    this.isHydrating = true;

    while (this.hydrationQueue.length > 0) {
      const element = this.hydrationQueue.shift();
      await this.hydrateElement(element);
    }

    this.isHydrating = false;
  }

  // Register element for observation
  observe(element) {
    if (this.observers.length > 0) {
      this.observers[0].observe(element);
    }
  }

  // Unregister element from observation
  unobserve(element) {
    this.observers.forEach(observer => observer.unobserve(element));
  }

  // Hydrate immediately (for critical components)
  async hydrateImmediately(element) {
    await this.hydrateElement(element);
  }

  // Hydrate all components at once
  async hydrateAll(container = document) {
    const elements = container.querySelectorAll('[data-component]:not([data-hydrated])');
    const promises = Array.from(elements).map(el => this.hydrateElement(el));
    await Promise.all(promises);
  }

  // Get hydration statistics
  getStats() {
    const total = document.querySelectorAll('[data-component]').length;
    const hydrated = document.querySelectorAll('[data-component][data-hydrated]').length;
    const pending = document.querySelectorAll('[data-component]:not([data-hydrated])').length;

    return {
      total,
      hydrated,
      pending,
      hydrationRatio: total > 0 ? (hydrated / total * 100).toFixed(2) : 0
    };
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.hydrationQueue = [];
    this.isIntersecting = new WeakMap();
  }
}

// Global hydrator instance
export const hydrator = new ProgressiveHydrator();