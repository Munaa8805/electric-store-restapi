import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { health } from '../controllers/healthController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { productRoutes } from './productRoutes.js';
import { categoryRoutes } from './categoryRoutes.js';
import { bannerRoutes } from './bannerRoutes.js';
import { reviewRoutes } from './reviewRoutes.js';
import { authRoutes } from './authRoutes.js';
import { userRoutes } from './userRoutes.js';

const router = Router();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests' },
});

router.use(globalLimiter);

router.get('/health', asyncHandler(health));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/banners', bannerRoutes);
router.use('/reviews', reviewRoutes);

export { router as apiV1Router };
