// Cart Modal Component
import { BaseComponent } from '../utils/BaseComponent.js';
import { eventBus } from '../utils/EventBus.js';
import { cartStore } from '../utils/CartStore.js';
import { animationManager } from '../utils/scroll.js';

export default class CartModal extends BaseComponent {
  constructor(props = {}) {
    super();
    this.props = {
      isOpen: false,
      ...props
    };
    this.overlay = null;
    this.content = null;
  }

  onMounted() {
    this.setupEventListeners();
    this.updateCartDisplay();
  }

  onUnmounted() {
    // Cleanup event listeners
    eventBus.off('cart:changed', this.updateCartDisplay.bind(this));
  }

  setupEventListeners() {
    // Listen for cart changes
    eventBus.on('cart:changed', this.updateCartDisplay.bind(this));

    // Close on overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    // Close button
    const closeBtn = this.element.querySelector('.cart-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Checkout button
    const checkoutBtn = this.element.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.handleCheckout());
    }
  }

  open() {
    this.props.isOpen = true;
    this.element.classList.add('open');
    this.updateCartDisplay();

    // Animate modal entrance
    animationManager.fadeIn(this.content, 300);
    animationManager.slideIn(this.content, 'right', 50, 300);
  }

  close() {
    this.props.isOpen = false;
    this.element.classList.remove('open');

    // Animate modal exit
    animationManager.fadeIn(this.content, 300, 0, () => {
      // Animation complete callback
    });
  }

  updateCartDisplay() {
    if (!this.props.isOpen) return;

    const cart = cartStore.getSummary();
    const cartItems = this.element.querySelector('.cart-items');
    const cartTotal = this.element.querySelector('#cartTotal');
    const cartCount = document.getElementById('cartCount');

    if (cartCount) {
      cartCount.textContent = cart.itemCount;
    }

    if (cartTotal) {
      cartTotal.textContent = cart.total.toFixed(2);
    }

    if (cartItems) {
      if (cart.items.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
      } else {
        cartItems.innerHTML = cart.items.map((item, index) => `
          <div class="cart-item" data-id="${item.productId}" style="animation-delay: ${index * 50}ms">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <div class="cart-item-details">
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                <div class="cart-item-quantity">
                  <button class="quantity-btn minus" data-id="${item.productId}">-</button>
                  <span class="quantity-value">${item.quantity}</span>
                  <button class="quantity-btn plus" data-id="${item.productId}">+</button>
                </div>
              </div>
            </div>
            <button class="cart-item-remove" data-id="${item.productId}">×</button>
          </div>
        `).join('');

        // Add event listeners for quantity controls
        this.setupQuantityControls();

        // Animate cart items
        animationManager.staggerIn(cartItems.querySelectorAll('.cart-item'), 'right', 50, 300);
      }
    }
  }

  setupQuantityControls() {
    const cartItems = this.element.querySelector('.cart-items');

    // Quantity buttons
    cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = parseInt(e.target.dataset.id);
        const isPlus = e.target.classList.contains('plus');

        if (isPlus) {
          cartStore.addItem({ productId, quantity: 1 });
        } else {
          const currentQty = cartStore.getItemQuantity(productId);
          if (currentQty > 1) {
            cartStore.updateItem(productId, currentQty - 1);
          } else {
            cartStore.removeItem(productId);
          }
        }
      });
    });

    // Remove buttons
    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = parseInt(e.target.dataset.id);
        cartStore.removeItem(productId);

        // Animate removal
        const cartItem = e.target.closest('.cart-item');
        animationManager.fadeIn(cartItem, 200, 0, () => {
          cartItem.remove();
          this.updateCartDisplay();
        });
      });
    });
  }

  handleCheckout() {
    // In a real app, this would redirect to checkout
    alert('Checkout functionality would be implemented here!\n\nCart Total: $' + cartStore.getTotal().toFixed(2));

    // Clear cart for demo
    cartStore.clear();
    this.close();
  }

  render() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'cart-overlay';

    this.content = document.createElement('div');
    this.content.className = 'cart-content';

    this.content.innerHTML = `
      <div class="cart-header">
        <h2>Shopping Cart</h2>
        <button class="cart-close">&times;</button>
      </div>
      <div class="cart-items">
        <p class="cart-empty">Your cart is empty</p>
      </div>
      <div class="cart-footer">
        <div class="cart-total">
          <span>Total: $<span id="cartTotal">0.00</span></span>
        </div>
        <button class="checkout-btn">Checkout</button>
      </div>
    `;

    const element = document.createElement('div');
    element.className = 'cart-modal';
    element.id = 'cartModal';

    element.appendChild(this.overlay);
    element.appendChild(this.content);

    return element;
  }
}