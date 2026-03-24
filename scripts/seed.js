import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from '../src/models/Category.js';
import { Banner } from '../src/models/Banner.js';
import { Product } from '../src/models/Product.js';
import { Review } from '../src/models/Review.js';
import { User } from '../src/models/User.js';
import { refreshProductReviewStats } from '../src/controllers/reviewController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

dotenv.config({ path: path.join(root, '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI missing. Copy .env.example to .env');
  process.exit(1);
}

async function loadJson(name) {
  const raw = await readFile(path.join(root, 'data', name), 'utf8');
  return JSON.parse(raw);
}

function emailFromName(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${slug || 'reviewer'}@seed.local`;
}

async function seed() {
  await mongoose.connect(uri);

  const [categoriesRaw, bannersRaw, productsRaw, reviewsRaw] = await Promise.all([
    loadJson('categories.json'),
    loadJson('banners.json'),
    loadJson('products.json'),
    loadJson('reviews.json'),
  ]);

  await Promise.all([
    Review.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Banner.deleteMany({}),
    User.deleteMany({}),
  ]);

  await User.create({
    name: 'Admin',
    email: 'admin@store.local',
    password: 'Admin1234!',
    role: 'admin',
  });

  const reviewerNames = [...new Set(reviewsRaw.map((r) => r.userName))];
  const userIdByName = new Map();
  for (const name of reviewerNames) {
    const u = await User.create({
      name,
      email: emailFromName(name),
      password: 'Reviewer1!',
      role: 'user',
    });
    userIdByName.set(name, u._id);
  }

  const categories = await Category.insertMany(
    categoriesRaw.map((c) => ({
      name: c.name,
      icon: c.icon,
      image: c.image,
    }))
  );

  const categoryIdByName = new Map(categories.map((c) => [c.name, c._id]));

  await Banner.insertMany(
    bannersRaw.map((b) => ({
      title: b.title,
      subtitle: b.subtitle,
      image: b.image,
      cta: b.cta,
      link: b.link,
      color: b.color,
    }))
  );

  const products = await Product.insertMany(
    productsRaw.map((p) => {
      const categoryId = categoryIdByName.get(p.category);
      if (!categoryId) {
        throw new Error(`Unknown category "${p.category}" for product ${p.name}`);
      }
      return {
        name: p.name,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        category: categoryId,
        image: p.image,
        imageGallery: [],
        averageRating: p.rating ?? 0,
        reviewCount: p.reviews ?? 0,
        isFeatured: Boolean(p.isFeatured),
        specs: p.specs && typeof p.specs === 'object' ? { ...p.specs } : {},
      };
    })
  );

  const productIdByLegacy = new Map(
    productsRaw.map((p, i) => [p.id, products[i]._id])
  );

  await Review.insertMany(
    reviewsRaw.map((r) => {
      const productId = productIdByLegacy.get(r.productId);
      const userId = userIdByName.get(r.userName);
      if (!productId) throw new Error(`Unknown productId in review: ${r.productId}`);
      if (!userId) throw new Error(`Unknown userName in review: ${r.userName}`);
      return {
        product: productId,
        user: userId,
        rating: r.rating,
        comment: r.comment,
        date: r.date ? new Date(r.date) : new Date(),
      };
    })
  );

  for (const p of products) {
    await refreshProductReviewStats(p._id);
  }

  console.log(
    `Seeded ${products.length} products, ${categories.length} categories, ${bannersRaw.length} banners, ${reviewsRaw.length} reviews, ${1 + reviewerNames.length} users`
  );
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
