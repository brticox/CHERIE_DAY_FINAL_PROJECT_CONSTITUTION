import { describe, expect, it } from 'vitest';
import { adminProductSchema } from '@/lib/validation/admin-product';

const valid = { name: 'İnci Mühür Davetiye', slug: 'inci-muhur-davetiye', description: 'Kalın dokulu kâğıt ve prova onayıyla hazırlanır.', behavior_type: 'proof_required_cart', base_price: 120, stock_mode: 'made_to_order', production_time_days: 10, proof_required: true, is_personalizable: true, status: 'draft' } as const;

describe('admin product validation', () => {
  it('accepts a truthful made-to-order draft', () => expect(adminProductSchema.safeParse(valid).success).toBe(true));
  it('rejects unsafe slugs', () => expect(adminProductSchema.safeParse({ ...valid, slug: 'İnci Mühür' }).success).toBe(false));
  it('requires a positive price for cart products', () => expect(adminProductSchema.safeParse({ ...valid, base_price: 0 }).success).toBe(false));
  it('requires description before publish', () => expect(adminProductSchema.safeParse({ ...valid, description: '', status: 'published' }).success).toBe(false));
  it('allows inquiry products without a numeric price', () => expect(adminProductSchema.safeParse({ ...valid, behavior_type: 'inquiry_only', base_price: null }).success).toBe(true));
});
