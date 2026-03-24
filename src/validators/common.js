import { z } from 'zod';

export const objectIdParamSchema = z
  .object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id'),
  })
  .strict();
