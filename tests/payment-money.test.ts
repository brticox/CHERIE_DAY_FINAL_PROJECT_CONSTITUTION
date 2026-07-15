import { describe, expect, it } from 'vitest';

import {
  addMinor,
  assertCurrency,
  minorToTryDecimal,
  MoneyError,
  multiplyMinor,
  percentageOfMinor,
  tryToMinor,
} from '@/lib/payments/money';

describe('TRY minor-unit arithmetic', () => {
  it('converts decimal strings deterministically', () => {
    expect(tryToMinor('0.01')).toBe(1);
    expect(tryToMinor('34.56')).toBe(3456);
    expect(tryToMinor('1250.5')).toBe(125050);
    expect(minorToTryDecimal(125050)).toBe('1250.50');
  });

  it('rejects zero, negative, excess precision, overflow and excessive values', () => {
    for (const value of ['0', '-1.00', '1.001', '100000000.01']) {
      expect(() => tryToMinor(value)).toThrow(MoneyError);
    }
    expect(() => tryToMinor(Number.MAX_SAFE_INTEGER)).toThrow(MoneyError);
  });

  it('uses integer half-up rounding for percentage add-ons', () => {
    expect(percentageOfMinor(999, '2.50')).toBe(25);
    expect(percentageOfMinor(1001, '2.50')).toBe(25);
    expect(addMinor(multiplyMinor(125050, 2), 4990)).toBe(255090);
  });

  it('accepts only TRY/TL provider currency', () => {
    expect(() => assertCurrency('TRY')).not.toThrow();
    expect(() => assertCurrency('TL')).not.toThrow();
    expect(() => assertCurrency('USD')).toThrowError('MONEY_CURRENCY_MISMATCH');
  });
});
