import { z } from 'zod';

export const createCategoryBodySchema = z
  .object({
    name: z.string().min(1).max(100),
    icon: z.string().max(100).optional(),
    image: z.string().max(2000).optional(),
  })
  .strict();

export const updateCategoryBodySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    icon: z.string().max(100).optional(),
    image: z.string().max(2000).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });
