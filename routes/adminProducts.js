const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// ─── All routes below require authentication ─────────────────────────
router.use(authMiddleware);

// ═════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ═════════════════════════════════════════════════════════════════════

// GET /api/admin/products — list all
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/products/:id — single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/admin/products — create product
router.post('/products', async (req, res) => {
  try {
    const { title, category, price, originalPrice, rating, reviews, image, badge, description, features, driveLink, active, sortOrder } = req.body;

    if (!title || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'title, category, and price are required.' });
    }

    const product = new Product({
      title, category, price,
      originalPrice: originalPrice || undefined,
      rating: rating || 4.5,
      reviews: reviews || 0,
      image: image || '',
      badge: badge || '',
      description: description || '',
      features: features || [],
      driveLink: driveLink || '',
      active: active !== undefined ? active : true,
      sortOrder: sortOrder || 0,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// PUT /api/admin/products/:id — update product
router.put('/products/:id', async (req, res) => {
  try {
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// DELETE /api/admin/products/:id — delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ═════════════════════════════════════════════════════════════════════
//  CATEGORIES
// ═════════════════════════════════════════════════════════════════════

// GET /api/admin/categories — list all
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });

    // Attach product count per category
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

// POST /api/admin/categories — create category
router.post('/categories', async (req, res) => {
  try {
    const { name, slug, description, image, sortOrder } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'name and slug are required.' });
    }

    // Check slug uniqueness
    const existing = await Category.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A category with this slug already exists.' });
    }

    const category = new Category({
      name, slug: slug.toLowerCase(), description: description || '',
      image: image || '', sortOrder: sortOrder || 0,
    });

    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// PUT /api/admin/categories/:id — update category
router.put('/categories/:id', async (req, res) => {
  try {
    const updates = req.body;
    // If slug changed, check uniqueness
    if (updates.slug) {
      const dup = await Category.findOne({ slug: updates.slug.toLowerCase(), _id: { $ne: req.params.id } });
      if (dup) return res.status(409).json({ success: false, message: 'Slug already in use.' });
      updates.slug = updates.slug.toLowerCase();
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// DELETE /api/admin/categories/:id — delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    // Un-categorise products that used this category
    await Product.updateMany({ category: category.slug }, { $set: { category: 'uncategorised' } });
    res.json({ success: true, message: 'Category deleted. Products moved to "uncategorised".' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ═════════════════════════════════════════════════════════════════════
//  IMAGE UPLOAD (Cloudinary)
// ═════════════════════════════════════════════════════════════════════

// POST /api/admin/upload — upload image to Cloudinary
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'imtechguru/products',
      resource_type: 'image',
    });

    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Upload failed.' });
  }
});

// DELETE /api/admin/upload — delete image from Cloudinary
router.delete('/upload', async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ success: false, message: 'public_id is required.' });

    await cloudinary.uploader.destroy(public_id);
    res.json({ success: true, message: 'Image deleted.' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
});

module.exports = router;
