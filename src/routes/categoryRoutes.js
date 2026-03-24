import { Router } from 'express';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { objectIdParamSchema } from '../validators/common.js';
import {
  createCategoryBodySchema,
  updateCategoryBodySchema,
} from '../validators/categoryValidators.js';

const categoryRoutes = Router();

const admin = [authenticate, authorize('admin')];

categoryRoutes.get('/', asyncHandler(listCategories));

categoryRoutes.get(
  '/:id',
  validate({ params: objectIdParamSchema }),
  asyncHandler(getCategory)
);

categoryRoutes.post(
  '/',
  ...admin,
  validate({ body: createCategoryBodySchema }),
  asyncHandler(createCategory)
);

categoryRoutes.patch(
  '/:id',
  ...admin,
  validate({ params: objectIdParamSchema }),
  validate({ body: updateCategoryBodySchema }),
  asyncHandler(updateCategory)
);

categoryRoutes.delete(
  '/:id',
  ...admin,
  validate({ params: objectIdParamSchema }),
  asyncHandler(deleteCategory)
);

export { categoryRoutes };
