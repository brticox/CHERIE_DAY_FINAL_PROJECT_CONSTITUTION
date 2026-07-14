import { z } from 'zod';

export const adminProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3, 'Ürün adı en az 3 karakter olmalı.').max(120),
  slug: z.string().trim().min(3).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug yalnızca küçük harf, sayı ve tire içerebilir.'),
  description: z.string().trim().max(6000).optional().default(''),
  category_id: z.string().uuid().nullable().optional(),
  collection_id: z.string().uuid().nullable().optional(),
  behavior_type: z.enum(['cart_enabled','proof_required_cart','digital_checkout','quote_required','inquiry_only','reservation_request','city_dependent_service']),
  base_price: z.coerce.number().min(0).nullable().optional(),
  stock_mode: z.enum(['in_stock','made_to_order','preorder','unavailable']),
  production_time_days: z.coerce.number().int().min(0).max(365).nullable().optional(),
  proof_required: z.boolean().default(false),
  is_personalizable: z.boolean().default(false),
  status: z.enum(['draft','published']),
}).superRefine((value, ctx) => {
  if (['cart_enabled','proof_required_cart'].includes(value.behavior_type) && (!value.base_price || value.base_price <= 0)) ctx.addIssue({ code: 'custom', path: ['base_price'], message: 'Sepete eklenebilen ürünlerde geçerli bir fiyat zorunludur.' });
  if (value.status === 'published' && !value.description) ctx.addIssue({ code: 'custom', path: ['description'], message: 'Yayın için ürün açıklaması zorunludur.' });
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
