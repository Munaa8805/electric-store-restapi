import { Router } from 'express';
import { getMe, updateMe } from '../controllers/userController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileBodySchema } from '../validators/userValidators.js';

const userRoutes = Router();

userRoutes.use(authenticate);

userRoutes.get('/me', asyncHandler(getMe));

userRoutes.patch(
  '/me',
  validate({ body: updateProfileBodySchema }),
  asyncHandler(updateMe)
);

export { userRoutes };
