import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

// --- Database Simulation ---
// 1. Database Structure (Tables / Schema)
// We simulate a database using arrays here. In a real app, this would be a Postgres or MySQL database.

// Table: phone_models (This is the central inventory)
interface PhoneModel {
  id: string;
  name: string;
  stock: number;
}

// Table: product_designs
interface ProductDesign {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

// Table: orders
interface Order {
  id: string;
  designId: string;
  phoneModelId: string;
  quantity: number;
  status: string;
  createdAt: Date;
}

// Initial Data (Seed)
let phoneModels: PhoneModel[] = [
  { id: 'ip-17', name: 'iPhone 17', stock: 15 },
  { id: 'ip-16', name: 'iPhone 16', stock: 5 },
  { id: 'ip-16-pro', name: 'iPhone 16 Pro', stock: 2 }, // Low stock
  { id: 'sam-s25', name: 'Samsung Galaxy S25', stock: 8 },
  { id: 'pix-10', name: 'Google Pixel 10', stock: 0 },   // Out of stock
];

let productDesigns: ProductDesign[] = [
  { id: 'floral-dream', name: 'Floral Dream', imageUrl: 'https://images.unsplash.com/photo-1550524458-18e4745ac6a1?w=500&auto=format&fit=crop', price: 29.99 },
  { id: 'marble-gold', name: 'Marble Gold', imageUrl: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=500&auto=format&fit=crop', price: 24.99 },
  { id: 'synthwave-neon', name: 'Synthwave Neon', imageUrl: 'https://images.unsplash.com/photo-1555580399-4ee7dd23cce9?w=500&auto=format&fit=crop', price: 34.99 },
  { id: 'minimal-grid', name: 'Minimal Grid', imageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=500&auto=format&fit=crop', price: 19.99 },
];

let orders: Order[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---
  
  // Get all phone models and their current stock
  app.get('/api/inventory', (req, res) => {
    res.json(phoneModels);
  });

  // Admin: Update stock for a specific phone model
  app.put('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    const modelIndex = phoneModels.findIndex(m => m.id === id);
    if (modelIndex === -1) {
      return res.status(404).json({ error: 'Phone model not found' });
    }

    phoneModels[modelIndex].stock = stock;
    res.json(phoneModels[modelIndex]);
  });

  // Get all product designs
  app.get('/api/products', (req, res) => {
    res.json(productDesigns);
  });

  // Get a specific product design
  app.get('/api/products/:id', (req, res) => {
    const product = productDesigns.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // Create an order and reduce shared inventory
  app.post('/api/orders', (req, res) => {
    const { designId, phoneModelId, quantity } = req.body;

    if (!designId || !phoneModelId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    const modelIndex = phoneModels.findIndex(m => m.id === phoneModelId);
    if (modelIndex === -1) {
      return res.status(404).json({ error: 'Phone model not found' });
    }

    const model = phoneModels[modelIndex];

    // Check if sufficient stock is available
    if (model.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock for this phone model' });
    }

    // Deduct stock globally
    phoneModels[modelIndex] = {
      ...model,
      stock: model.stock - quantity
    };

    // Create order
    const order: Order = {
      id: Math.random().toString(36).substring(2, 9),
      designId,
      phoneModelId,
      quantity,
      status: 'confirmed',
      createdAt: new Date()
    };
    orders.push(order);

    res.json({ success: true, order, updatedStock: phoneModels[modelIndex].stock });
  });

  // Get all orders (for admin)
  app.get('/api/orders', (req, res) => {
    // Join with designs and models for richer output
    const detailedOrders = orders.map(o => ({
      ...o,
      design: productDesigns.find(d => d.id === o.designId),
      phoneModel: phoneModels.find(m => m.id === o.phoneModelId)
    }));
    
    res.json(detailedOrders);
  });

  // --- Vite Middleware (Development) / Static Serving (Production) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Reconstruct __dirname for ES modules
    const __dirname = path.resolve();
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
