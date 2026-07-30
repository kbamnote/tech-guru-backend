const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

// GET /api/categories — list categories with product counts
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });

    const enriched = await Promise.all(categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat.slug, active: true });
      return { ...cat.toObject(), count };
    }));

    res.json({ success: true, categories: enriched });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
