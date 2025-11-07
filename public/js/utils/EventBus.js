// Event Bus for component communication
export class EventBus {
  constructor() {
    this.events = {};
    this.middlewares = [];
  }

  // Register event listener
  on(event, callback, context = null) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push({
      callback: context ? callback.bind(context) : callback,
      context
    });

    return this;
  }

  // Register one-time event listener
  once(event, callback, context = null) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback.apply(context, args);
    };

    return this.on(event, onceCallback);
  }

  // Unregister event listener
  off(event, callback) {
    if (!this.events[event]) return this;

    if (!callback) {
      // Remove all listeners for this event
      delete this.events[event];
      return this;
    }

    // Remove specific callback
    this.events[event] = this.events[event].filter(
      listener => listener.callback !== callback
    );

    return this;
  }

  // Emit event
  emit(event, ...args) {
    if (!this.events[event]) return this;

    // Apply middlewares
    let processedArgs = args;
    for (const middleware of this.middlewares) {
      processedArgs = middleware(event, processedArgs);
      if (processedArgs === false) return this; // Middleware cancelled the event
    }

    // Call all listeners
    this.events[event].forEach(listener => {
      try {
        listener.callback(...processedArgs);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });

    return this;
  }

  // Add middleware
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  // Remove middleware
  removeMiddleware(middleware) {
    this.middlewares = this.middlewares.filter(m => m !== middleware);
    return this;
  }

  // Get all registered events
  getEvents() {
    return Object.keys(this.events);
  }

  // Get listeners count for an event
  getListenersCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }

  // Clear all events and middlewares
  clear() {
    this.events = {};
    this.middlewares = [];
  }
}

// Global event bus instance
export const eventBus = new EventBus();