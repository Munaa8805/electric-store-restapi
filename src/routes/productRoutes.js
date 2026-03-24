import { Router } from 'express';
import {
  listProducts,
  listFeaturedProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  listProductsQuerySchema,
  featuredProductsQuerySchema,
  productIdParamSchema,
  createProductBodySchema,
  updateProductBodySchema,
} from '../validators/productValidators.js';

const productRoutes = Router();

const admin = [authenticate, authorize('admin')];

productRoutes.get(
  '/',
  validate({ query: listProductsQuerySchema }),
  asyncHandler(listProducts)
);

productRoutes.get(
  '/featured',
  validate({ query: featuredProductsQuerySchema }),
  asyncHandler(listFeaturedProducts)
);

/** Only 24-char hex ids match — avoids `/:id` capturing the path `featured` */
const mongoIdParam = '/:id([0-9a-fA-F]{24})';

productRoutes.get(
  mongoIdParam,
  validate({ params: productIdParamSchema }),
  asyncHandler(getProduct)
);

productRoutes.post(
  '/',
  ...admin,
  validate({ body: createProductBodySchema }),
  asyncHandler(createProduct)
);

productRoutes.patch(
  mongoIdParam,
  ...admin,
  validate({ params: productIdParamSchema }),
  validate({ body: updateProductBodySchema }),
  asyncHandler(updateProduct)
);

productRoutes.delete(
  mongoIdParam,
  ...admin,
  validate({ params: productIdParamSchema }),
  asyncHandler(deleteProduct)
);

export { productRoutes };
