// The three canonical storefront categories.
// `slug` is the stable key: Product.category holds this value, and the
// frontend routes on /category/:slug — so these must not change casually.
const categories = [
  {
    name: 'Kids eBooks',
    slug: 'kids',
    description: 'Fun, interactive learning for little minds',
    image: '/images/kids-ebooks.png',
    sortOrder: 1,
  },
  {
    name: 'Educational Books',
    slug: 'educational',
    description: 'Curriculum-aligned guides for every grade',
    image: '/images/edu-books.png',
    sortOrder: 2,
  },
  {
    name: 'Content Bundles',
    slug: 'bundles',
    description: 'Everything creators need to grow fast',
    image: '/images/content-bundles.png',
    sortOrder: 3,
  },
];

module.exports = categories;
