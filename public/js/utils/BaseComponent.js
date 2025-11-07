// Base Component class with lifecycle hooks
export class BaseComponent {
  constructor(options = {}) {
    this.element = null;
    this.props = {};
    this.state = {};
    this.children = [];
    this.isMounted = false;
    this.isHydrated = false;
    this.eventListeners = [];

    // Initialize with options
    Object.assign(this, options);
  }

  // Lifecycle hooks
  onBeforeMount() {}
  onMounted() {}
  onBeforeUpdate() {}
  onUpdated() {}
  onBeforeUnmount() {}
  onUnmounted() {}

  // Set props and trigger update
  setProps(newProps) {
    this.props = { ...this.props, ...newProps };
    this.update();
  }

  // Set state and trigger update
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.update();
  }

  // Update component
  update() {
    if (!this.isMounted) return;

    this.onBeforeUpdate();
    this.render();
    this.onUpdated();
  }

  // Mount component to DOM
  mount(container) {
    this.onBeforeMount();
    this.element = this.render();

    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (container && this.element) {
      container.appendChild(this.element);
      this.attachEventListeners();
      this.isMounted = true;
      this.onMounted();
    }

    return this;
  }

  // Hydrate server-rendered component
  hydrate(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (container) {
      this.element = container;
      this.attachEventListeners();
      this.isMounted = true;
      this.isHydrated = true;
      this.onMounted();
    }

    return this;
  }

  // Unmount component
  unmount() {
    if (!this.isMounted) return;

    this.onBeforeUnmount();
    this.detachEventListeners();

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.isMounted = false;
    this.isHydrated = false;
    this.onUnmounted();
  }

  // Destroy component completely
  destroy() {
    this.unmount();
    this.children.forEach(child => {
      if (typeof child.destroy === 'function') {
        child.destroy();
      }
    });
    this.children = [];
  }

  // Add child component
  addChild(child) {
    if (child && typeof child.mount === 'function') {
      this.children.push(child);
    }
  }

  // Remove child component
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      if (typeof child.destroy === 'function') {
        child.destroy();
      }
      this.children.splice(index, 1);
    }
  }

  // Add event listener
  addEventListener(event, handler, options = {}) {
    this.eventListeners.push({ event, handler, options });
    if (this.element) {
      this.element.addEventListener(event, handler, options);
    }
  }

  // Attach all stored event listeners
  attachEventListeners() {
    if (!this.element) return;

    this.eventListeners.forEach(({ event, handler, options }) => {
      this.element.addEventListener(event, handler, options);
    });
  }

  // Detach all event listeners
  detachEventListeners() {
    if (!this.element) return;

    this.eventListeners.forEach(({ event, handler, options }) => {
      this.element.removeEventListener(event, handler, options);
    });
  }

  // Utility method to create DOM element
  createElement(tagName, attributes = {}, children = []) {
    const element = document.createElement(tagName);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });

    // Append children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });

    return element;
  }

  // Abstract method to be implemented by subclasses
  render() {
    throw new Error('render() method must be implemented by subclass');
  }
}

// Server-side rendering helper
export class ServerComponent extends BaseComponent {
  renderToString() {
    // This would be used on the server side with a virtual DOM or template engine
    return this.render().outerHTML;
  }
}