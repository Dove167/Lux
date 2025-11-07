import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import fs from 'fs';
import path from 'path';

// Initialize database (simple JSON-based for now)
let products = [
  {
    id: 1,
    name: 'Classic Black Aviators',
    price: 149.99,
    image: '/static/images/classic-black.jpg',
    description: 'Timeless black aviator sunglasses with UV protection'
  },
  {
    id: 2,
    name: 'Retro Round Gold',
    price: 129.99,
    image: '/static/images/retro-round-gold.jpg',
    description: 'Vintage-inspired round frames in gold'
  },
  {
    id: 3,
    name: 'Sport Performance Blue',
    price: 189.99,
    image: '/static/images/sport-performance.jpg',
    description: 'High-performance sports sunglasses with polarized lenses'
  },
  {
    id: 4,
    name: 'Minimalist Square',
    price: 99.99,
    image: '/static/images/minimalist-square.jpg',
    description: 'Clean, minimalist square frames for everyday wear'
  }
];

let nextProductId = 5;

const app = new Hono();

// Middleware
// For this prototype, serve everything in /public from the root.
// This removes ambiguity and guarantees:
//  - /main.css                        -> public/main.css
//  - /admin.css                       -> public/admin.css
//  - /js/utils/ComponentRegistry.js   -> public/js/utils/ComponentRegistry.js
//  - /js/components/Hero.js           -> public/js/components/Hero.js
//  - /images/...                      -> public/images/...
app.use('/*', serveStatic({ root: './public' }));

// API Routes
app.get('/api/products', async (c) => {
  return c.json(products);
});

app.get('/api/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const product = products.find(p => p.id === id);
  if (!product) return c.json({ error: 'Product not found' }, 404);
  return c.json(product);
});

app.post('/api/products', async (c) => {
  const data = await c.req.json();
  const newProduct = {
    id: nextProductId++,
    name: data.name,
    price: parseFloat(data.price),
    image: data.image || '',
    description: data.description || ''
  };
  products.push(newProduct);
  return c.json({ id: newProduct.id });
});

app.put('/api/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const data = await c.req.json();
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) return c.json({ error: 'Product not found' }, 404);

  products[productIndex] = {
    ...products[productIndex],
    name: data.name,
    price: parseFloat(data.price),
    image: data.image || '',
    description: data.description || ''
  };
  return c.json({ success: true });
});

app.delete('/api/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) return c.json({ error: 'Product not found' }, 404);

  products.splice(productIndex, 1);
  return c.json({ success: true });
});

// Cart API (simple in-memory for demo)
let cart = [];

app.get('/api/cart', (c) => {
  return c.json(cart);
});

app.post('/api/cart', async (c) => {
  const item = await c.req.json();
  const existing = cart.find(i => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }
  return c.json(cart);
});

app.delete('/api/cart/:productId', (c) => {
  const productId = parseInt(c.req.param('productId'));
  cart = cart.filter(item => item.productId !== productId);
  return c.json(cart);
});

// Serve static JavaScript files

// Render EJS templates
app.get('/', async (c) => {
  const html = await renderTemplate('index', { products });
  return c.html(html);
});

app.get('/admin', async (c) => {
  const html = await renderTemplate('admin', { products });
  return c.html(html);
});

// Helper function to render EJS templates
async function renderTemplate(templateName, data) {
  const ejs = (await import('ejs')).default;
  const templatePath = path.join('./public', `${templateName}.ejs`);
  const template = fs.readFileSync(templatePath, 'utf8');
  return ejs.render(template, data);
}

export default app;