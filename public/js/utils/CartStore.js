// Cart Store using EventBus for state management
import { eventBus } from './EventBus.js';

export class CartStore {
  constructor() {
    this.items = [];
    this.loadFromStorage();

    // Listen for cart events
    eventBus.on('cart:add', this.addItem.bind(this));
    eventBus.on('cart:remove', this.removeItem.bind(this));
    eventBus.on('cart:update', this.updateItem.bind(this));
    eventBus.on('cart:clear', this.clear.bind(this));
  }

  // Add item to cart
  addItem(product) {
    const existing = this.items.find(item =>
      item.productId === product.productId
    );

    if (existing) {
      existing.quantity += product.quantity || 1;
    } else {
      this.items.push({
        productId: product.productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity || 1
      });
    }

    this.save();
    this.emitChange();
  }

  // Remove item from cart
  removeItem(productId) {
    this.items = this.items.filter(item => item.productId !== productId);
    this.save();
    this.emitChange();
  }

  // Update item quantity
  updateItem(productId, quantity) {
    const item = this.items.find(item => item.productId === productId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeItem(productId);
      } else {
        this.save();
        this.emitChange();
      }
    }
  }

  // Get all items
  getItems() {
    return [...this.items];
  }

  // Get item count
  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Get total price
  getTotal() {
    return this.items.reduce((total, item) =>
      total + (item.price * item.quantity), 0
    );
  }

  // Clear cart
  clear() {
    this.items = [];
    this.save();
    this.emitChange();
  }

  // Check if cart has item
  hasItem(productId) {
    return this.items.some(item => item.productId === productId);
  }

  // Get item quantity
  getItemQuantity(productId) {
    const item = this.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  // Save to localStorage
  save() {
    try {
      localStorage.setItem('lux_cart', JSON.stringify(this.items));
    } catch (error) {
      console.warn('Failed to save cart to localStorage:', error);
    }
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('lux_cart');
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load cart from localStorage:', error);
      this.items = [];
    }
  }

  // Emit change event
  emitChange() {
    eventBus.emit('cart:changed', {
      items: this.getItems(),
      itemCount: this.getItemCount(),
      total: this.getTotal()
    });
  }

  // Get cart summary
  getSummary() {
    return {
      items: this.getItems(),
      itemCount: this.getItemCount(),
      total: this.getTotal(),
      formattedTotal: `$${this.getTotal().toFixed(2)}`
    };
  }
}

// Global cart store instance
export const cartStore = new CartStore();