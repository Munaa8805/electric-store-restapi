import { z } from 'zod';

export const updateProfileBodySchema = z
  .object({
    name: z.string().min(3).max(100).optional(),
    phone: z.string().max(40).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    zip: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
    image: z.string().max(2000).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });
