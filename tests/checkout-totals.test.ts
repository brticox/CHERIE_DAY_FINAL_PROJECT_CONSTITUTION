import { describe, expect, it } from 'vitest';

import { checkoutTotal } from '@/lib/checkout/totals';

describe('checkout payable total', () => {
  it('withholds a final total until delivery is selected', () => {
    expect(checkoutTotal(195, null)).toEqual({
      subtotal: 195,
      shipping: null,
      total: null,
    });
  });

  it('adds delivery with kuruş-safe arithmetic', () => {
    expect(checkoutTotal(195.4, 39.9)).toEqual({
      subtotal: 195.4,
      shipping: 39.9,
      total: 235.3,
    });
  });

  it('shows free delivery without changing the payable amount', () => {
    expect(checkoutTotal(195, 0).total).toBe(195);
  });
});
