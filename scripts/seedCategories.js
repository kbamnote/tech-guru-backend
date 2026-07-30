/**
 * Seeds the three canonical categories into MongoDB.
 *
 * Idempotent: upserts on `slug`, so re-running only fills in missing
 * documents and refreshes name/description/image/sortOrder. It never
 * deletes categories and never touches products.
 *
 *   npm run seed:categories
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const categories = require('../data/categories');

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set. Check your .env file.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'imtechguru' });
  console.log('✅ Connected to MongoDB');

  for (const cat of categories) {
    const result = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: cat },
      // Mongoose 8: `includeResultMetadata` (the old name was `rawResult`).
      { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
    );

    const created = !result.lastErrorObject?.updatedExisting;
    console.log(`${created ? '➕ created' : '↻ updated'}  ${cat.slug.padEnd(12)} ${cat.name}`);
  }

  const total = await Category.countDocuments();
  console.log(`\n🎉 Done. ${total} categor${total === 1 ? 'y' : 'ies'} now in the database.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
