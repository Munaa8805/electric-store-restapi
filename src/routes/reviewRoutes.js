import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { listReviews, createReview } from '../controllers/reviewController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  listReviewsQuerySchema,
  createReviewBodySchema,
} from '../validators/reviewValidators.js';

const reviewRoutes = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many review submissions' },
});

reviewRoutes.get(
  '/',
  validate({ query: listReviewsQuerySchema }),
  asyncHandler(listReviews)
);

reviewRoutes.post(
  '/',
  writeLimiter,
  authenticate,
  validate({ body: createReviewBodySchema }),
  asyncHandler(createReview)
);

export { reviewRoutes };
