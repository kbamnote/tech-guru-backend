require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');
const paymentRouter = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
      /^https?:\/\/((www\.)?imtechguru\.in)$/,
      /\.vercel\.app$/,
      /\.railway\.app$/
    ];

    const isAllowed = allowedOrigins.some(regex => regex.test(origin));

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ImTechGuru API is running.' });
});

// ─── MongoDB Connection ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: 'imtechguru',
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
