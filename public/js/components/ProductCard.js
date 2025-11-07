// ProductCard component with Canvas 2D lens reflection
import { BaseComponent } from '../utils/BaseComponent.js';
import { eventBus } from '../utils/EventBus.js';

export default class ProductCard extends BaseComponent {
  constructor(props = {}) {
    super();
    this.props = {
      id: null,
      name: '',
      price: 0,
      image: '',
      description: '',
      ...props
    };
    this.canvas = null;
    this.lensEffect = null;
    this.mouseX = 0;
    this.mouseY = 0;
  }

  onMounted() {
    this.setupCanvas();
    this.setupEventListeners();
  }

  onUnmounted() {
    this.cleanupCanvas();
  }

  setupCanvas() {
    const canvasContainer = this.element.querySelector('.product-canvas');
    if (!canvasContainer) return;

    this.canvas = document.createElement('canvas');
    this.canvas.width = canvasContainer.offsetWidth;
    this.canvas.height = canvasContainer.offsetHeight;
    this.canvas.className = 'product-reflection-canvas';

    canvasContainer.appendChild(this.canvas);

    this.lensEffect = new LensReflection(this.canvas);
    this.animate();
  }

  setupEventListeners() {
    const card = this.element;

    // Mouse tracking for lens effect
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    // Add to cart
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.addToCart();
      });
    }

    // Card hover effects
    card.addEventListener('mouseenter', () => {
      card.classList.add('hovered');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('hovered');
    });
  }

  addToCart() {
    eventBus.emit('cart:add', {
      productId: this.props.id,
      name: this.props.name,
      price: this.props.price,
      image: this.props.image,
      quantity: 1
    });

    // Visual feedback
    const btn = this.element.querySelector('.add-to-cart-btn');
    if (btn) {
      btn.textContent = 'Added!';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.classList.remove('added');
      }, 2000);
    }
  }

  animate() {
    if (!this.lensEffect) return;

    this.lensEffect.update();
    requestAnimationFrame(() => this.animate());
  }

  render() {
    const element = document.createElement('div');
    element.className = 'product-card';
    element.dataset.productId = this.props.id;

    element.innerHTML = `
      <div class="product-image-container">
        <img src="${this.props.image}" alt="${this.props.name}" class="product-image" loading="lazy">
        <div class="product-canvas"></div>
        <div class="product-overlay">
          <button class="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${this.props.name}</h3>
        <p class="product-price">$${this.props.price.toFixed(2)}</p>
        <p class="product-description">${this.props.description}</p>
      </div>
    `;

    return element;
  }

  cleanupCanvas() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.lensEffect = null;
  }
}

// Lens reflection effect class
class LensReflection {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mouseX = 0;
    this.mouseY = 0;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Create lens reflection effect
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const lensSize = 30;

    // Calculate angle from center to mouse
    const angle = Math.atan2(this.mouseY - centerY, this.mouseX - centerX);
    const distance = Math.min(20, Math.sqrt(
      Math.pow(this.mouseX - centerX, 2) + Math.pow(this.mouseY - centerY, 2)
    ));

    const glintX = centerX + Math.cos(angle) * distance;
    const glintY = centerY + Math.sin(angle) * distance;

    // Draw lens
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, lensSize, lensSize * 0.7, angle, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw glint
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(glintX, glintY, 8, 12, angle, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX - 5, centerY - 5, 5, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }
}