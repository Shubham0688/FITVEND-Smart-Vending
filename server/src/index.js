import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import registerFitcoinRoutes from './fitcoin.js';
import registerAdsRoutes from './ads.js';

dotenv.config();

const app = express();

// =================================
// MIDDLEWARE
// =================================

app.use(cors());
app.use(express.json());

// =================================
// FITCOIN ROUTES
// =================================

registerFitcoinRoutes(app);

// =================================
// ADVERTISEMENT ROUTES
// =================================

registerAdsRoutes(app);

// =================================
// DATABASE STATUS
// =================================

let dbReady = false;

// =================================
// PRODUCT SCHEMA
// =================================

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  description: String,
  tag: String,
  image: String,

  stock: {
    type: Number,
    default: 0
  },

  active: {
    type: Boolean,
    default: true
  }
});

// =================================
// ORDER SCHEMA
// =================================

const orderSchema = new mongoose.Schema({
  user: String,

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },

  productName: String,
  quantity: Number,
  total: Number,
  paymentStatus: String,
  paymentMethod: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// =================================
// MODELS
// =================================

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// =================================
// PRODUCT SEED DATA
// =================================

const seed = [
  {
    name: 'Classic Protein Shake',
    category: 'Shake',
    price: 99,
    description: 'Ready-to-drink sealed shake.',
    tag: 'Vegetarian',
    image: 'classic-shake.jpg',
    stock: 18
  },
  {
    name: 'Plant Protein Shake',
    category: 'Shake',
    price: 119,
    description: 'Plant-based packaged shake.',
    tag: 'Vegan',
    image: 'plant-shake.jpg',
    stock: 20
  },
  {
    name: 'Protein Bar',
    category: 'Snack',
    price: 55,
    description: 'Convenient packaged snack.',
    tag: 'Vegetarian',
    image: 'protein-bar.jpg',
    stock: 25
  },
  {
    name: 'Lactose-Free Protein Drink',
    category: 'Drink',
    price: 129,
    description: 'Lactose-free packaged drink.',
    tag: 'Lactose-free',
    image: 'lactose-free.jpg',
    stock: 10
  },
  {
    name: 'Peanut Butter Energy Bar',
    category: 'Snack',
    price: 65,
    description: 'Packaged peanut butter snack.',
    tag: 'Vegetarian',
    image: 'peanut-bar.jpg',
    stock: 15
  },
  {
    name: 'Roasted Almond Pack',
    category: 'Snack',
    price: 75,
    description: 'Packaged roasted almonds.',
    tag: 'Vegetarian',
    image: 'almonds.jpg',
    stock: 20
  },
  {
    name: 'Oats Energy Drink',
    category: 'Drink',
    price: 89,
    description: 'Packaged oats-based drink.',
    tag: 'Vegetarian',
    image: 'oats-drink.jpg',
    stock: 12
  },
  {
    name: 'Coconut Water',
    category: 'Drink',
    price: 45,
    description: 'Packaged coconut water.',
    tag: 'Vegan',
    image: 'coconut-water.jpg',
    stock: 20
  },
  {
    name: 'Electrolyte Drink',
    category: 'Drink',
    price: 60,
    description: 'Packaged electrolyte drink.',
    tag: 'Vegetarian',
    image: 'electrolyte.jpg',
    stock: 18
  },
  {
    name: 'Trail Mix Pack',
    category: 'Snack',
    price: 80,
    description: 'Packaged nuts and dried fruit mix.',
    tag: 'Vegan',
    image: 'trail-mix.jpg',
    stock: 14
  },
  {
    name: 'Soy Protein Drink',
    category: 'Drink',
    price: 109,
    description: 'Packaged soy-based drink.',
    tag: 'Vegan',
    image: 'soy-drink.jpg',
    stock: 16
  },
  {
    name: 'Banana Oat Bar',
    category: 'Snack',
    price: 50,
    description: 'Packaged banana and oat snack.',
    tag: 'Vegetarian',
    image: 'banana-bar.jpg',
    stock: 22
  }
];

// =================================
// DEMO MEMORY DATA
// =================================

let memProducts = seed.map((p, i) => ({
  ...p,
  active: true,
  _id: `demo${i}`
}));

let memOrders = [];

// =================================
// DATABASE CONNECTION
// =================================

async function init() {
  if (!process.env.MONGODB_URI) {
    console.log('MongoDB URI not found. Using demo-memory mode.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    dbReady = true;

    if (await Product.countDocuments() === 0) {
      await Product.insertMany(seed);
    }

    console.log('MongoDB connected successfully');

  } catch (error) {
    dbReady = false;

    console.log(
      'MongoDB unavailable; using demo-memory mode:',
      error.message
    );
  }
}

// =================================
// GET PRODUCTS FUNCTION
// =================================

const getProducts = () => {
  return dbReady
    ? Product.find({ active: true }).sort({ price: 1 })
    : memProducts.filter(p => p.active);
};

// =================================
// HEALTH API
// =================================

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: dbReady ? 'MongoDB' : 'demo-memory'
  });
});

// =================================
// GET PRODUCTS API
// =================================

app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);

  } catch (error) {
    res.status(500).json({
      message: 'Unable to fetch products',
      error: error.message
    });
  }
});

// =================================
// RECOMMENDATION API
// =================================

app.post('/api/recommend', async (req, res) => {
  try {
    const { height, weight, age, goal, workout } = req.body;

    const h = Number(height) / 100;
    const w = Number(weight);
    const a = Number(age);

    if (
      !Number.isFinite(h) ||
      !Number.isFinite(w) ||
      !Number.isFinite(a) ||
      !h || !w || !a ||
      h < 0.5 || h > 2.5 ||
      w < 10 || w > 350 ||
      a < 1 || a > 110
    ) {
      return res.status(400).json({
        message: 'Enter valid profile details.'
      });
    }

    const bmi = +(w / (h * h)).toFixed(1);

    // Fetch products from the active storage system
    const products = await getProducts();

    let note;

    if (a < 18) {
      note =
        'For users under 18, this demo does not calculate BMI categories or protein targets. Ask a parent/guardian and qualified healthcare professional about nutrition.';
    } else {
      note =
        'BMI is a screening measure, not a nutrition prescription. This demo does not calculate a personal protein dose. Choose products by label and dietary needs.';
    }

    const picks = products
      .filter(p =>
        goal === 'Plant-based'
          ? p.tag === 'Vegan'
          : goal === 'Lactose-free'
            ? p.tag === 'Lactose-free'
            : true
      )
      .slice(0, 3);

    res.json({
      bmi: a >= 18 ? bmi : null,
      goal,
      workout,
      note,
      recommendations: picks
    });

  } catch (error) {
    res.status(500).json({
      message: 'Recommendation failed',
      error: error.message
    });
  }
});

// =================================
// CREATE ORDER API
// =================================

app.post('/api/orders', async (req, res) => {
  try {
    const {
      productId,
      quantity = 1,
      user = 'Guest',
      paymentMethod = 'UPI'
    } = req.body;

    const q = Math.max(1, Math.min(5, Number(quantity) || 1));

    let p;

    if (dbReady) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          message: 'Invalid product ID'
        });
      }

      p = await Product.findById(productId);

    } else {
      p = memProducts.find(x => x._id === productId);
    }

    if (!p || !p.active) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    if (p.stock < q) {
      return res.status(400).json({
        message: 'Not enough stock available'
      });
    }

    // Update product stock
    p.stock -= q;

    if (dbReady) {
      await p.save();
    }

    const order = {
      user,
      productName: p.name,
      quantity: q,
      total: p.price * q,
      paymentStatus: 'DEMO_PAID',
      paymentMethod,
      createdAt: new Date()
    };

    if (dbReady) {
      const saved = await Order.create({
        ...order,
        product: p._id
      });

      return res.status(201).json(saved);
    }

    order._id = `FV${Date.now()}`;

    memOrders.unshift(order);

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({
      message: 'Unable to create order',
      error: error.message
    });
  }
});

// =================================
// GET ORDERS API
// =================================

app.get('/api/orders', async (req, res) => {
  try {
    if (dbReady) {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(50);

      return res.json(orders);
    }

    res.json(memOrders.slice(0, 50));

  } catch (error) {
    res.status(500).json({
      message: 'Unable to fetch orders',
      error: error.message
    });
  }
});

// =================================
// ADMIN SUMMARY API
// =================================

app.get('/api/admin/summary', async (req, res) => {
  try {
    const products = await getProducts();

    const orders = dbReady
      ? await Order.find()
      : memOrders;

    res.json({
      products,
      orders,
      totalOrders: orders.length,
      revenue: orders.reduce((sum, order) => sum + order.total, 0)
    });

  } catch (error) {
    res.status(500).json({
      message: 'Unable to fetch admin summary',
      error: error.message
    });
  }
});

// =================================
// UPDATE PRODUCT STOCK API
// =================================

app.patch('/api/admin/products/:id/stock', async (req, res) => {
  try {
    const stock = Math.max(
      0,
      Number(req.body.stock) || 0
    );

    if (dbReady) {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          message: 'Invalid product ID'
        });
      }

      const p = await Product.findByIdAndUpdate(
        req.params.id,
        { stock },
        { new: true }
      );

      return p
        ? res.json(p)
        : res.status(404).json({ message: 'Product not found' });
    }

    const p = memProducts.find(
      x => x._id === req.params.id
    );

    if (!p) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    p.stock = stock;

    res.json(p);

  } catch (error) {
    res.status(500).json({
      message: 'Unable to update stock',
      error: error.message
    });
  }
});

// =================================
// GLOBAL ERROR HANDLER
// =================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);

  res.status(500).json({
    message: 'Internal server error'
  });
});

// =================================
// START SERVER
// =================================

const port = process.env.PORT || 5000;

init().finally(() => {
  app.listen(port, () => {
    console.log(
      `FitVend API running at http://localhost:${port}`
    );

    console.log(
      `Database mode: ${dbReady ? 'MongoDB' : 'demo-memory'}`
    );
  });
});