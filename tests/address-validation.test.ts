import { describe, expect, it } from 'vitest';

import { addressSchema, normalizeTrPhone } from '@/lib/validation/address';

const base = {
  fullName: 'Maison Test',
  phone: '0532 111 22 33',
  city: 'İstanbul',
  district: 'Kadıköy',
  addressLine: 'Moda Caddesi No 10',
};

describe('normalizeTrPhone', () => {
  it('strips separators to digits', () => {
    expect(normalizeTrPhone('0532 111 22 33')).toBe('05321112233');
    expect(normalizeTrPhone('(212) 123-45-67')).toBe('2121234567');
  });
  it('keeps a leading +', () => {
    expect(normalizeTrPhone('+90 532 111 22 33')).toBe('+905321112233');
  });
  it('never throws on empty input', () => {
    expect(normalizeTrPhone('   ')).toBe('');
  });
});

describe('addressSchema', () => {
  it('accepts a valid Turkish address', () => {
    const result = addressSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('defaults the optional flags to false', () => {
    const result = addressSchema.parse(base);
    expect(result.isDefaultShipping).toBe(false);
    expect(result.isDefaultBilling).toBe(false);
  });

  it('requires full name, city, district, address line', () => {
    for (const field of ['fullName', 'city', 'district', 'addressLine'] as const) {
      const result = addressSchema.safeParse({ ...base, [field]: '' });
      expect(result.success, `${field} should be required`).toBe(false);
    }
  });

  it('rejects an invalid phone', () => {
    expect(addressSchema.safeParse({ ...base, phone: 'abc' }).success).toBe(false);
  });

  it('rejects a non-5-digit postal code but allows empty', () => {
    expect(addressSchema.safeParse({ ...base, postalCode: '123' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...base, postalCode: '34710' }).success).toBe(true);
    expect(addressSchema.safeParse({ ...base, postalCode: '' }).success).toBe(true);
  });

  it('accepts optional label, neighborhood and notes', () => {
    const result = addressSchema.safeParse({
      ...base,
      label: 'Ev',
      neighborhood: 'Caferağa',
      notes: 'Zili çalmayın',
    });
    expect(result.success).toBe(true);
  });
});
