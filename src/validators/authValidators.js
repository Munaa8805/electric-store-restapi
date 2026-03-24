import { z } from 'zod';

export const registerBodySchema = z
  .object({
    name: z.string().min(3).max(100),
    email: z
      .string()
      .email()
      .max(200)
      .transform((s) => s.trim().toLowerCase()),
    password: z.string().min(8).max(72),
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: z
      .string()
      .email()
      .max(200)
      .transform((s) => s.trim().toLowerCase()),
    password: z.string().min(1).max(200),
  })
  .strict();
