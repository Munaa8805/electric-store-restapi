import { Router } from 'express';
import {
  listBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { objectIdParamSchema } from '../validators/common.js';
import {
  createBannerBodySchema,
  updateBannerBodySchema,
} from '../validators/bannerValidators.js';

const bannerRoutes = Router();

const admin = [authenticate, authorize('admin')];

bannerRoutes.get('/', asyncHandler(listBanners));

bannerRoutes.get(
  '/:id',
  validate({ params: objectIdParamSchema }),
  asyncHandler(getBanner)
);

bannerRoutes.post(
  '/',
  ...admin,
  validate({ body: createBannerBodySchema }),
  asyncHandler(createBanner)
);

bannerRoutes.patch(
  '/:id',
  ...admin,
  validate({ params: objectIdParamSchema }),
  validate({ body: updateBannerBodySchema }),
  asyncHandler(updateBanner)
);

bannerRoutes.delete(
  '/:id',
  ...admin,
  validate({ params: objectIdParamSchema }),
  asyncHandler(deleteBanner)
);

export { bannerRoutes };
