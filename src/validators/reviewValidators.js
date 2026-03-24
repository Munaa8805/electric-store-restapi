import { z } from 'zod';

export const listReviewsQuerySchema = z
  .object({
    productId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid product id'),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();

export const createReviewBodySchema = z
  .object({
    productId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid product id'),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().min(2).max(2000),
    date: z.coerce.date().optional(),
  })
  .strict();
