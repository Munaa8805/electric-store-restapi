import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Review } from '../models/Review.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const populateCategory = { path: 'category', select: 'name icon image' };

function sortOption(sort) {
  switch (sort) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'rating_desc':
      return { averageRating: -1, reviewCount: -1 };
    case 'newest':
      return { createdAt: -1 };
    default:
      return { isFeatured: -1, averageRating: -1 };
  }
}

async function resolveCategoryId(value) {
  if (!value) return null;
  const v = String(value).trim();
  if (mongoose.isValidObjectId(v)) return v;
  const cat = await Category.findOne({
    name: new RegExp(`^${escapeRegex(v)}$`, 'i'),
  }).lean();
  return cat?._id ?? null;
}

async function buildProductFilter(query) {
  const filter = {};
  if (query.featured === 'true') filter.isFeatured = true;
  if (query.featured === 'false') filter.isFeatured = false;
  if (query.search) filter.$text = { $search: query.search };

  if (query.category) {
    const cid = await resolveCategoryId(query.category);
    if (!cid) return { __noMatch: true };
    filter.category = cid;
  }

  return filter;
}

export async function listProducts(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = await buildProductFilter(req.query);
  if (filter.__noMatch) {
    return res.json({
      success: true,
      data: [],
      meta: paginationMeta({ total: 0, page, limit }),
    });
  }
  delete filter.__noMatch;

  let sort = sortOption(req.query.sort);
  let projection;
  if (req.query.search && !req.query.sort) {
    sort = { score: { $meta: 'textScore' } };
    projection = { score: { $meta: 'textScore' } };
  }

  const [total, items] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter, projection)
      .populate(populateCategory)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  res.json({
    success: true,
    data: items.map(serializeProduct),
    meta: paginationMeta({ total, page, limit }),
  });
}

/** GET /products/featured — only products with isFeatured === true */
export async function listFeaturedProducts(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { isFeatured: true };

  if (req.query.search) filter.$text = { $search: req.query.search };

  if (req.query.category) {
    const cid = await resolveCategoryId(req.query.category);
    if (!cid) {
      return res.json({
        success: true,
        data: [],
        meta: paginationMeta({ total: 0, page, limit }),
      });
    }
    filter.category = cid;
  }

  let sort = sortOption(req.query.sort);
  let projection;
  if (req.query.search && !req.query.sort) {
    sort = { score: { $meta: 'textScore' } };
    projection = { score: { $meta: 'textScore' } };
  }

  const [total, items] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter, projection)
      .populate(populateCategory)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  res.json({
    success: true,
    data: items.map(serializeProduct),
    meta: paginationMeta({ total, page, limit }),
  });
}

export async function getProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid product id');
  }
  const doc = await Product.findById(req.params.id).populate(populateCategory).lean();
  if (!doc) throw new AppError(404, 'Product not found');
  res.json({ success: true, data: serializeProduct(doc) });
}

export async function createProduct(req, res) {
  const categoryId = await resolveCategoryId(req.body.category);
  if (!categoryId) throw new AppError(400, 'Invalid category');

  const payload = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    discountPrice: req.body.discountPrice,
    category: categoryId,
    image: req.body.image,
    imageGallery: req.body.imageGallery ?? [],
    averageRating: req.body.averageRating ?? 0,
    reviewCount: req.body.reviewCount ?? 0,
    isFeatured: req.body.isFeatured ?? false,
    specs: req.body.specs ?? {},
  };

  const created = await Product.create(payload);
  const doc = await Product.findById(created._id).populate(populateCategory).lean();
  res.status(201).json({ success: true, data: serializeProduct(doc) });
}

export async function updateProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid product id');
  }
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError(404, 'Product not found');

  const b = req.body;
  const fields = [
    'name',
    'description',
    'price',
    'discountPrice',
    'image',
    'imageGallery',
    'averageRating',
    'reviewCount',
    'isFeatured',
    'specs',
  ];
  for (const key of fields) {
    if (b[key] !== undefined) product[key] = b[key];
  }
  if (b.category !== undefined) {
    const categoryId = await resolveCategoryId(b.category);
    if (!categoryId) throw new AppError(400, 'Invalid category');
    product.category = categoryId;
  }

  if (b.discountPrice !== undefined) {
    const effectivePrice = b.price !== undefined ? b.price : product.price;
    if (b.discountPrice > effectivePrice) {
      throw new AppError(400, 'discountPrice must be <= price');
    }
  }

  await product.save();

  const doc = await Product.findById(product._id).populate(populateCategory).lean();
  res.json({ success: true, data: serializeProduct(doc) });
}

export async function deleteProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid product id');
  }
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError(404, 'Product not found');
  await Review.deleteMany({ product: product._id });
  await product.deleteOne();
  res.status(204).send();
}

async function findProductById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Product.findById(id);
}

function serializeProduct(doc) {
  if (!doc) return null;
  const { score: _score, ...rest } = doc;
  const category =
    rest.category && typeof rest.category === 'object'
      ? {
        id: rest.category._id,
        name: rest.category.name,
        icon: rest.category.icon,
        image: rest.category.image,
      }
      : rest.category;

  return {
    id: rest._id,
    name: rest.name,
    description: rest.description,
    price: rest.price,
    discountPrice: rest.discountPrice,
    category,
    image: rest.image,
    imageGallery: rest.imageGallery ?? [],
    rating: rest.averageRating,
    averageRating: rest.averageRating,
    reviews: rest.reviewCount,
    reviewCount: rest.reviewCount,
    isFeatured: rest.isFeatured,
    specs: rest.specs && typeof rest.specs === 'object' ? rest.specs : {},
    createdAt: rest.createdAt,
    updatedAt: rest.updatedAt,
  };
}

export { findProductById };
