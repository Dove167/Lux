-- Products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  image TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample sunglasses data
INSERT INTO products (name, price, image, description) VALUES
('Classic Black Aviators', 149.99, '/static/images/classic-black.jpg', 'Timeless black aviator sunglasses with UV protection'),
('Retro Round Gold', 129.99, '/static/images/retro-round-gold.jpg', 'Vintage-inspired round frames in gold'),
('Sport Performance Blue', 189.99, '/static/images/sport-performance.jpg', 'High-performance sports sunglasses with polarized lenses'),
('Minimalist Square', 99.99, '/static/images/minimalist-square.jpg', 'Clean, minimalist square frames for everyday wear'),
('Cat Eye Vintage', 159.99, '/static/images/cat-eye-vintage.jpg', 'Retro cat eye frames with gradient lenses'),
('Wayfarer Style', 119.99, '/static/images/wayfarer-style.jpg', 'Classic wayfarer sunglasses in modern colors'),
('Oversized Round', 179.99, '/static/images/oversized-round.jpg', 'Bold oversized round sunglasses for maximum style'),
('Pilot Sunglasses', 199.99, '/static/images/pilot-sunglasses.jpg', 'Premium pilot-style sunglasses with crystal lenses');