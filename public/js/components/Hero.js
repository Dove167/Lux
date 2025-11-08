 // Hero component with interactive Canvas 2D lens reflections and particles + clean-luxury animations
import { BaseComponent } from '../utils/BaseComponent.js';
import { componentRegistry } from '../utils/ComponentRegistry.js';
import { smoothScroll, animationManager } from '../utils/scroll.js';

export default class Hero extends BaseComponent {
  constructor(props = {}) {
    super();
    this.props = {
      title: 'Luxury Sunglasses',
      subtitle: 'Experience the difference',
      ctaText: 'Shop Now',
      ...props
    };
    this.canvas = null;
    this.lensEffect = null;
    this.particles = null;
    this.animationFrame = null;
  }

  onMounted() {
    this.setupCanvas();
    this.setupParticles();
    this.startAnimation();
    this.setupEventListeners();
    this.animateEntrance();
  }

  onUnmounted() {
    this.stopAnimation();
    this.cleanup();
  }

  setupCanvas() {
    const canvasContainer = this.element.querySelector('.hero-canvas-container');
    if (!canvasContainer) return;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'hero-canvas';
    this.canvas.width = canvasContainer.offsetWidth;
    this.canvas.height = canvasContainer.offsetHeight;

    canvasContainer.appendChild(this.canvas);

    this.lensEffect = new LensEffect(this.canvas);
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  setupParticles() {
    if (!this.canvas) return;
    this.particles = new ParticleSystem(this.canvas);
  }

  resizeCanvas() {
    if (!this.canvas) return;

    const container = this.element.querySelector('.hero-canvas-container');
    if (container) {
      this.canvas.width = container.offsetWidth;
      this.canvas.height = container.offsetHeight;
    }
  }

  setupEventListeners() {
    // Mouse tracking for interactive effects
    this.element.addEventListener('mousemove', (e) => {
      if (this.lensEffect) {
        const rect = this.canvas.getBoundingClientRect();
        this.lensEffect.updateMouse(e.clientX - rect.left, e.clientY - rect.top);
      }

      // Add particles on movement
      if (this.particles && Math.random() > 0.95) {
        const rect = this.canvas.getBoundingClientRect();
        this.particles.emit(e.clientX - rect.left, e.clientY - rect.top, 2);
      }
    });

    // CTA button scroll (Lenis first, then native smooth as fallback)
    const ctaBtn = this.element.querySelector('.hero-cta');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSelector = '#productsGrid';
        const target = document.querySelector(targetSelector) || document.getElementById('products');

        if (!target) return;

        // Prefer Lenis smoothScroll if available
        if (smoothScroll && typeof smoothScroll.scrollTo === 'function') {
          smoothScroll.scrollTo(target, { offset: -40 });
        } else {
          // Fallback: native smooth scroll
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  startAnimation() {
    const animate = () => {
      if (this.lensEffect) this.lensEffect.update();
      if (this.particles) this.particles.update();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  cleanup() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.lensEffect = null;
    this.particles = null;
  }

  // Hero entrance animation (subtle, coordinated)
  animateEntrance() {
    if (!animationManager) return;

    const content = this.element.querySelector('.hero-content');
    const title = this.element.querySelector('.hero-title');
    const subtitle = this.element.querySelector('.hero-subtitle');
    const cta = this.element.querySelector('.hero-cta');

    if (content && typeof animationManager.fadeIn === 'function') {
      animationManager.fadeIn(content, 800, 0);
    }

    if (title && typeof animationManager.slideIn === 'function') {
      animationManager.slideIn(title, 'up', 24, 800, 50);
    }
    if (subtitle && typeof animationManager.slideIn === 'function') {
      animationManager.slideIn(subtitle, 'up', 20, 800, 140);
    }
    if (cta && typeof animationManager.slideIn === 'function') {
      animationManager.slideIn(cta, 'up', 18, 800, 230);
    }
  }

  render() {
    const element = document.createElement('section');
    element.className = 'hero-section';

    element.innerHTML = `
      <div class="hero-canvas-container"></div>
      <div class="hero-content">
        <h1 class="hero-title">${this.props.title}</h1>
        <p class="hero-subtitle">${this.props.subtitle}</p>
        <button class="hero-cta">${this.props.ctaText}</button>
      </div>
    `;

    return element;
  }
}

// Lens effect class
class LensEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mouseX = 0;
    this.mouseY = 0;
    this.sunglasses = [];
    this.createSunglasses();
  }

  createSunglasses() {
    // Create multiple sunglasses at different positions
    this.sunglasses = [
      { x: this.canvas.width * 0.3, y: this.canvas.height * 0.4, scale: 1.2 },
      { x: this.canvas.width * 0.7, y: this.canvas.height * 0.6, scale: 0.8 },
      { x: this.canvas.width * 0.5, y: this.canvas.height * 0.3, scale: 1.5 }
    ];
  }

  updateMouse(x, y) {
    this.mouseX = x;
    this.mouseY = y;
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update sunglasses positions based on canvas size
    this.createSunglasses();

    // Draw each pair of sunglasses
    this.sunglasses.forEach(sunglasses => {
      this.drawSunglasses(sunglasses.x, sunglasses.y, sunglasses.scale);
    });
  }

  drawLens(x, y, size = 40, angle = 0) {
    // Calculate angle from lens center to mouse
    const angleToMouse = Math.atan2(this.mouseY - y, this.mouseX - x);
    const distance = Math.min(15, Math.sqrt(
      Math.pow(this.mouseX - x, 2) + Math.pow(this.mouseY - y, 2)
    ) * 0.3);

    const glintX = x + Math.cos(angleToMouse) * distance;
    const glintY = y + Math.sin(angleToMouse) * distance;

    // Draw lens
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, size, size * 0.75, angle, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw reflection/glint
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.ellipse(glintX, glintY, size * 0.2, size * 0.3, angleToMouse, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x - size * 0.1, y - size * 0.1, size * 0.1, size * 0.15, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawSunglasses(x, y, scale = 1) {
    const size = 40 * scale;
    const lensSpacing = 60 * scale;

    // Left lens
    this.drawLens(x - lensSpacing / 2, y, size);

    // Right lens
    this.drawLens(x + lensSpacing / 2, y, size);

    // Bridge
    this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
    this.ctx.lineWidth = 3 * scale;
    this.ctx.beginPath();
    this.ctx.moveTo(x - lensSpacing / 2 + size * 0.8, y);
    this.ctx.lineTo(x + lensSpacing / 2 - size * 0.8, y);
    this.ctx.stroke();

    // Temples (optional)
    this.ctx.strokeStyle = 'rgba(150, 150, 150, 0.6)';
    this.ctx.lineWidth = 2 * scale;

    // Left temple
    this.ctx.beginPath();
    this.ctx.moveTo(x - lensSpacing / 2 - size * 0.8, y);
    this.ctx.lineTo(x - lensSpacing / 2 - size * 1.5, y);
    this.ctx.stroke();

    // Right temple
    this.ctx.beginPath();
    this.ctx.moveTo(x + lensSpacing / 2 + size * 0.8, y);
    this.ctx.lineTo(x + lensSpacing / 2 + size * 1.5, y);
    this.ctx.stroke();
  }
}

// Particle system class
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
  }

  emit(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y));
    }
  }

  update() {
    this.particles = this.particles.filter(particle => particle.life > 0);
    this.particles.forEach(particle => {
      particle.update();
      particle.draw(this.ctx);
    });
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6;
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.01;
    this.size = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // gravity
    this.life -= this.decay;

    // Fade out
    if (this.life < 0) {
      this.life = 0;
    }
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.life * 0.6})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}