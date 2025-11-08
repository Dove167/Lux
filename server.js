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
    image: '/images/classic-black-aviator.png',
    description: 'Timeless black aviator silhouette with UV protection.'
  },
  {
    id: 2,
    name: 'Retro Round Gold',
    price: 129.99,
    image: '/images/retro-round-gold.png',
    description: 'Vintage-inspired round frame styling with warm metallic accents.'
  },
  {
    id: 3,
    name: 'Sport Performance Blue',
    price: 189.99,
    image: '/images/sport-perform-lens.png',
    description: 'Performance-forward wrap design with tinted lenses for active days.'
  },
  {
    id: 4,
    name: 'Minimalist Square Black',
    price: 99.99,
    image: '/images/minimalist-square-black.png',
    description: 'Clean, minimalist square frame for a modern everyday look.'
  },
  {
    id: 5,
    name: 'Tortoise Shell Classic',
    price: 139.99,
    image: '/images/tortoise-shell-classic.png',
    description: 'Rich tortoise shell pattern with a refined, timeless silhouette.'
  },
  {
    id: 6,
    name: 'Trans Crystal Frame',
    price: 119.99,
    image: '/images/trans-crystal-frame.png',
    description: 'Crystal-clear frame that feels light, modern, and editorial.'
  },
  {
    id: 7,
    name: 'Gold Rim Aviator Pilot',
    price: 209.99,
    image: '/images/gold-rim-aviator-pilot.png',
    description: 'Polished gold-rim pilot frame that signals premium craftsmanship.'
  },
  {
    id: 8,
    name: 'Oversized Fashion Frame',
    price: 159.99,
    image: '/images/oversized-fashion-frame.png',
    description: 'Bold oversized lenses for a confident, fashion-forward statement.'
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