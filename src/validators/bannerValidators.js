import { z } from 'zod';

export const createBannerBodySchema = z
  .object({
    title: z.string().min(3).max(100),
    subtitle: z.string().min(2).max(200).optional(),
    image: z.string().max(2000).optional(),
    cta: z.string().min(1).max(100).optional(),
    link: z.string().min(1).max(200).optional(),
    color: z.string().min(1).max(100).optional(),
  })
  .strict();

export const updateBannerBodySchema = z
  .object({
    title: z.string().min(3).max(100).optional(),
    subtitle: z.string().min(2).max(200).optional(),
    image: z.string().max(2000).optional(),
    cta: z.string().min(1).max(100).optional(),
    link: z.string().min(1).max(200).optional(),
    color: z.string().min(1).max(100).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });
