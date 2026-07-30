const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  category:    { type: String, required: true, trim: true },  // slug ref to Category
  price:       { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  rating:      { type: Number, default: 4.5, min: 0, max: 5 },
  reviews:     { type: Number, default: 0, min: 0 },
  image:       { type: String, default: '' },                 // Cloudinary URL
  badge:       { type: String, default: '' },
  description: { type: String, default: '' },
  features:    { type: [String], default: [] },
  driveLink:   { type: String, default: '' },                 // Google Drive PDF link
  active:      { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

// Auto-incrementing public ID (like the hardcoded 101, 201, 7, etc.)
// Using a sequence counter stored in a separate collection.
productSchema.statics.nextId = async function () {
  const counter = await mongoose.model('Counter').findByIdAndUpdate(
    'product_id',
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return counter.seq;
};

module.exports = mongoose.model('Product', productSchema);
