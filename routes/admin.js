const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// GET /api/admin/customers — get all customers (name + email only)
router.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find({}, 'name email orderId orderTotal paymentMethod createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: customers.length, customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/customers/:id — get single customer detail
router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    res.json({ success: true, customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
