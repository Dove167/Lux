// Component Registry for modular UI system
class ComponentRegistry {
  constructor() {
    this.registry = new Map();
    this.instances = new Map();
  }

  // Register a component class
  register(name, componentClass) {
    if (this.registry.has(name)) {
      console.warn(`Component "${name}" is already registered. Overwriting.`);
    }
    this.registry.set(name, componentClass);
  }

  // Get a registered component class
  get(name) {
    return this.registry.get(name);
  }

  // Create and track an instance
  createInstance(name, ...args) {
    const ComponentClass = this.get(name);
    if (!ComponentClass) {
      throw new Error(`Component "${name}" not found in registry`);
    }

    const instance = new ComponentClass(...args);
    const instanceId = this.generateInstanceId(name);
    this.instances.set(instanceId, instance);

    return { instance, instanceId };
  }

  // Get an instance by ID
  getInstance(instanceId) {
    return this.instances.get(instanceId);
  }

  // Destroy an instance
  destroyInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
    this.instances.delete(instanceId);
  }

  // Generate unique instance ID
  generateInstanceId(name) {
    return `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all registered component names
  getRegisteredComponents() {
    return Array.from(this.registry.keys());
  }

  // Check if component is registered
  has(name) {
    return this.registry.has(name);
  }

  // Clear registry (useful for testing)
  clear() {
    this.registry.clear();
    this.instances.clear();
  }
}

// Global registry instance
export const componentRegistry = new ComponentRegistry();