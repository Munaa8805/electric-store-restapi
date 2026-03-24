import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login } from '../controllers/authController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { registerBodySchema, loginBodySchema } from '../validators/authValidators.js';

const authRoutes = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts' },
});

authRoutes.post(
  '/register',
  authLimiter,
  validate({ body: registerBodySchema }),
  asyncHandler(register)
);

authRoutes.post(
  '/login',
  authLimiter,
  validate({ body: loginBodySchema }),
  asyncHandler(login)
);

export { authRoutes };
