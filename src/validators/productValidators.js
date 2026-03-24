import { z } from 'zod';

export const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    category: z.string().trim().min(1).optional(),
    featured: z.enum(['true', 'false']).optional(),
    search: z.string().trim().min(1).max(200).optional(),
    sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'newest']).optional(),
  })
  .strict();

export const featuredProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    category: z.string().trim().min(1).optional(),
    search: z.string().trim().min(1).max(200).optional(),
    sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'newest']).optional(),
  })
  .strict();

export const productIdParamSchema = z
  .object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id'),
  })
  .strict();

const imageGallerySchema = z.array(z.string().max(2000)).max(10).optional();

export const createProductBodySchema = z
  .object({
    name: z.string().min(3).max(200),
    description: z.string().min(10).max(5000).optional(),
    price: z.coerce.number().min(0),
    discountPrice: z.coerce.number().min(0).optional(),
    category: z.string().min(1).max(100),
    image: z.string().max(2000).optional(),
    imageGallery: imageGallerySchema,
    averageRating: z.coerce.number().min(0).max(5).optional(),
    reviewCount: z.coerce.number().int().min(0).optional(),
    isFeatured: z.boolean().optional(),
    specs: z.record(z.string()).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.discountPrice === undefined || data.discountPrice <= data.price,
    { message: 'discountPrice must be <= price', path: ['discountPrice'] }
  );

export const updateProductBodySchema = z
  .object({
    name: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: z.coerce.number().min(0).optional(),
    discountPrice: z.coerce.number().min(0).optional(),
    category: z.string().min(1).max(100).optional(),
    image: z.string().max(2000).optional(),
    imageGallery: imageGallerySchema,
    averageRating: z.coerce.number().min(0).max(5).optional(),
    reviewCount: z.coerce.number().int().min(0).optional(),
    isFeatured: z.boolean().optional(),
    specs: z.record(z.string()).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })
  .refine(
    (data) =>
      data.discountPrice === undefined ||
      data.price === undefined ||
      data.discountPrice <= data.price,
    { message: 'discountPrice must be <= price', path: ['discountPrice'] }
  );
