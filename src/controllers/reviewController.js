import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { findProductById } from './productController.js';

const populateUser = { path: 'user', select: 'name email image' };

function serialize(doc) {
  const user =
    doc.user && typeof doc.user === 'object'
      ? {
          id: doc.user._id,
          name: doc.user.name,
          email: doc.user.email,
          image: doc.user.image,
        }
      : doc.user;

  return {
    id: doc._id,
    productId: doc.product?._id?.toString?.() ?? doc.product?.toString?.() ?? doc.product,
    user,
    rating: doc.rating,
    comment: doc.comment,
    date: doc.date ? doc.date.toISOString().slice(0, 10) : undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function refreshProductReviewStats(productId) {
  const pid = new mongoose.Types.ObjectId(productId);
  const agg = await Review.aggregate([
    { $match: { product: pid } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        n: { $sum: 1 },
      },
    },
  ]);
  const row = agg[0];
  await Product.findByIdAndUpdate(productId, {
    averageRating: row ? Math.round(row.avgRating * 10) / 10 : 0,
    reviewCount: row ? row.n : 0,
  });
}

export async function listReviews(req, res) {
  if (!mongoose.isValidObjectId(req.query.productId)) {
    throw new AppError(400, 'Invalid product id');
  }
  const product = await findProductById(req.query.productId);
  if (!product) throw new AppError(404, 'Product not found');

  const { page, limit, skip } = parsePagination(req.query, {
    page: 1,
    limit: 20,
    maxLimit: 50,
  });
  const filter = { product: product._id };

  const [total, items] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .populate(populateUser)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  res.json({
    success: true,
    data: items.map((r) => serialize(r)),
    meta: paginationMeta({ total, page, limit }),
  });
}

export async function createReview(req, res) {
  if (!mongoose.isValidObjectId(req.body.productId)) {
    throw new AppError(400, 'Invalid product id');
  }
  const product = await findProductById(req.body.productId);
  if (!product) throw new AppError(404, 'Product not found');

  try {
    const review = await Review.create({
      product: product._id,
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
      date: req.body.date ?? new Date(),
    });
    await refreshProductReviewStats(product._id);

    const lean = await Review.findById(review._id).populate(populateUser).lean();
    res.status(201).json({ success: true, data: serialize(lean) });
  } catch (e) {
    if (e.code === 11000) {
      throw new AppError(409, 'You already reviewed this product');
    }
    throw e;
  }
}
