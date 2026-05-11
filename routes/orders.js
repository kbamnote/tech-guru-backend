const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Customer = require('../models/Customer');

const razorpay = new Razorpay({
  key_id: (process.env.RAZORPAY_KEY_ID || '').trim(),
  key_secret: (process.env.RAZORPAY_KEY_SECRET || '').trim(),
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('CRITICAL: Razorpay keys are missing in .env file!');
} else {
  console.log('Razorpay Key ID loaded:', process.env.RAZORPAY_KEY_ID.substring(0, 7) + '...');
  console.log('Razorpay Key Secret loaded:', process.env.RAZORPAY_KEY_SECRET.substring(0, 4) + '...');
}

// GET /api/orders/razorpay-key - Get Razorpay key
router.get('/razorpay-key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// POST /api/orders/create-razorpay-order - Create order in Razorpay
router.post('/create-razorpay-order', async (req, res) => {
  console.log('Received Razorpay order creation request:', req.body);
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required.' });
    }
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
  }
});

// POST /api/orders — save a new customer order
router.post('/', async (req, res) => {
  try {
    const { 
      name, email, orderId, paymentMethod, orderTotal, items,
      razorpay_payment_id, razorpay_order_id, razorpay_signature
    } = req.body;

    if (!name || !email || !orderId) {
      return res.status(400).json({ success: false, message: 'name, email, and orderId are required.' });
    }

    // Verify signature if razorpay details are present
    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');
      
      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    const customer = new Customer({
      name,
      email,
      orderId,
      paymentMethod: paymentMethod || 'upi',
      orderTotal: orderTotal || 0,
      items: items || [],
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    });

    await customer.save();

    res.status(201).json({ success: true, message: 'Order saved.', orderId: customer.orderId });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
