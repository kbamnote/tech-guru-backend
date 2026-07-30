const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// GET /api/products — list active products
router.get('/', async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.category) filter.category = req.query.category;

    const products = await Product.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/products/:id — single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.active) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
