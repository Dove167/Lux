// Product Grid Component for managing product display
import { BaseComponent } from '../utils/BaseComponent.js';
import { eventBus } from '../utils/EventBus.js';
import { componentRegistry } from '../utils/ComponentRegistry.js';
import { hydrator } from '../utils/ProgressiveHydrator.js';
import { animationManager } from '../utils/scroll.js';

export default class ProductGrid extends BaseComponent {
  constructor(props = {}) {
    super();
    this.props = {
      products: [],
      loading: false,
      ...props
    };
    this.productCards = [];
  }

  onMounted() {
    this.loadProducts();
    this.setupInfiniteScroll();
  }

  onUnmounted() {
    // Cleanup product cards
    this.productCards.forEach(card => {
      if (typeof card.destroy === 'function') {
        card.destroy();
      }
    });
    this.productCards = [];
  }

  async loadProducts() {
    // If products were provided via data-props (SSR), use them directly.
    if (Array.isArray(this.props.products) && this.props.products.length > 0) {
      this.renderProducts();
      return;
    }

    // Fallback: fetch from API (progressive enhancement)
    this.setState({ loading: true });

    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const products = await response.json();
      this.props.products = Array.isArray(products) ? products : [];
      this.renderProducts();
    } catch (error) {
      console.error('Failed to load products:', error);
      this.showError('Failed to load products. Please try again.');
    } finally {
      this.setState({ loading: false });
    }
  }

  renderProducts() {
    // Safety: ensure we have an array
    const products = Array.isArray(this.props.products) ? this.props.products : [];
    if (!products.length) {
      return;
    }

    // In our architecture, this.component element IS the grid container.
    // If inner markup already includes `.products-grid`, use it; otherwise, render directly.
    const grid = this.element.querySelector('.products-grid') || this.element;

    // Clear existing content inside grid (but keep the grid element itself)
    grid.innerHTML = '';

    this.productCards = products.map((product, index) => {
      const cardElement = this.createProductCardElement(product, index);
      grid.appendChild(cardElement);

      // Progressive-enhancement: hydrate nested ProductCard via data-component
      // (ProgressiveHydrator will pick it up), no manual registry usage here.
      return cardElement;
    });

    // Animate cards in with Anime.js helper (stagger, subtle)
    this.animateProductCards();

    // Emit event for any observers (e.g., infinite scroll, metrics)
    eventBus.emit('products:loaded', { count: products.length });
  }

  createProductCardElement(product, index) {
    const cardWrapper = document.createElement('div');
    // Using Tailwind classes for the container
    cardWrapper.className = 'group relative overflow-hidden rounded-lg shadow-lg bg-white transform transition-transform duration-300 hover:scale-105';
    cardWrapper.style.animationDelay = `${index * 100}ms`;
    cardWrapper.dataset.productId = product.id;

    cardWrapper.innerHTML = `
      <div class="product-card-wrapper"
           data-component="ProductCard"
           data-props='${JSON.stringify(product)}'>
        <div class="product-card" data-product-id="${product.id}">
          <div class="relative">
            <img src="${product.image || '/static/images/placeholder.jpg'}"
                 alt="${product.name}"
                 class="w-full h-64 object-cover"
                 loading="lazy">
            <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button class="add-to-cart-btn bg-white text-black py-2 px-4 rounded-full font-bold hover:bg-gray-200 transition-colors">Add to Cart</button>
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800">${product.name}</h3>
            <p class="text-md font-bold text-gray-900 mt-1">$${product.price.toFixed(2)}</p>
            <p class="text-sm text-gray-600 mt-2">${product.description}</p>
          </div>
        </div>
      </div>
    `;

    return cardWrapper;
  }

  animateProductCards() {
    const cards = this.element.querySelectorAll('.product-card-container');
    animationManager.staggerIn(cards, 'up', 100, 600);
  }

  setupInfiniteScroll() {
    // Simple implementation - in a real app you'd implement proper pagination
    let loadingMore = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !loadingMore && !this.props.loading) {
          // Load more products when reaching the end
          this.loadMoreProducts();
        }
      });
    }, { threshold: 0.1 });

    // Observe the last product card
    const updateObserver = () => {
      const cards = this.element.querySelectorAll('.product-card-container');
      if (cards.length > 0) {
        observer.observe(cards[cards.length - 1]);
      }
    };

    // Update observer when new cards are added
    eventBus.on('products:loaded', updateObserver);
  }

  async loadMoreProducts() {
    // In a real implementation, this would load more products with pagination
    // For now, just reload the same products for demo purposes
    console.log('Loading more products...');
  }

  showError(message) {
    const grid = this.element.querySelector('.products-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="error-message">
          <p>${message}</p>
          <button class="retry-btn">Retry</button>
        </div>
      `;

      const retryBtn = grid.querySelector('.retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => this.loadProducts());
      }
    }
  }

  filterProducts(filters) {
    // Filter products based on criteria
    let filtered = [...this.props.products];

    if (filters.category) {
      filtered = filtered.filter(product =>
        product.category === filters.category
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(product =>
        product.price >= filters.priceRange.min &&
        product.price <= filters.priceRange.max
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }

    // Re-render with filtered products
    const originalProducts = this.props.products;
    this.props.products = filtered;
    this.renderProducts();
    this.props.products = originalProducts;
  }

  sortProducts(sortBy) {
    const sorted = [...this.props.products];

    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    const originalProducts = this.props.products;
    this.props.products = sorted;
    this.renderProducts();
    this.props.products = originalProducts;
  }

  render() {
    const element = document.createElement('section');
    element.className = 'products-section';
    element.id = 'products';

    element.innerHTML = `
      <div class="container">
        <div class="products-header">
          <h2 class="section-title">Our Collection</h2>
          <div class="products-controls">
            <div class="sort-controls">
              <label for="sort-select">Sort by:</label>
              <select id="sort-select" class="sort-select">
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
        <div class="products-grid">
          ${this.props.loading ? '<div class="loading-spinner">Loading products...</div>' : ''}
        </div>
      </div>
    `;

    // Add sort functionality
    setTimeout(() => {
      const sortSelect = element.querySelector('#sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          this.sortProducts(e.target.value);
        });
      }
    }, 0);

    return element;
  }
}