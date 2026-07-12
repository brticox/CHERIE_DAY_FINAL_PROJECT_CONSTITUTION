import { z } from 'zod';

const customizationValue = z.union([
  z.string().trim().max(2000),
  z.number().finite(),
  z.boolean(),
]);

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1).max(10000),
  personalization: z.record(z.string().uuid(), customizationValue).default({}),
  addonIds: z.array(z.string().uuid()).max(20).default([]),
  uploadIds: z.array(z.string().uuid()).max(10).default([]),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10000).optional(),
  restore: z.boolean().optional(),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
