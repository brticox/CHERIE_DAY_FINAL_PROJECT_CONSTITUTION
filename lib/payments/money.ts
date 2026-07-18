export const TRY_CURRENCY = 'TRY' as const;
export const MAX_PAYMENT_MINOR = 10_000_000_000;

export class MoneyError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'MoneyError';
  }
}

/**
 * Convert a trusted decimal TRY value to kuruş without floating-point math.
 * Values must be positive for financial actions; zero is available explicitly
 * for internal subtotal composition.
 */
export function tryToMinor(
  value: string | number,
  options: { allowZero?: boolean } = {},
): number {
  const normalized = normalizeDecimal(value);
  const match = /^(\d{1,12})(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) throw new MoneyError('MONEY_INVALID_DECIMAL');

  const major = Number(match[1]);
  const fraction = Number((match[2] ?? '').padEnd(2, '0'));
  const minor = major * 100 + fraction;
  if (!Number.isSafeInteger(minor)) throw new MoneyError('MONEY_OVERFLOW');
  if (minor > MAX_PAYMENT_MINOR) throw new MoneyError('MONEY_LIMIT_EXCEEDED');
  if (minor < 0 || (!options.allowZero && minor === 0)) {
    throw new MoneyError('MONEY_MUST_BE_POSITIVE');
  }
  return minor;
}

export function minorToTryDecimal(minor: number): string {
  assertMinor(minor, true);
  return `${Math.floor(minor / 100)}.${String(minor % 100).padStart(2, '0')}`;
}

export function addMinor(...values: number[]): number {
  const total = values.reduce((sum, value) => {
    assertMinor(value, true);
    return sum + value;
  }, 0);
  assertMinor(total, true);
  return total;
}

export function multiplyMinor(unitMinor: number, quantity: number): number {
  assertMinor(unitMinor);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10_000) {
    throw new MoneyError('MONEY_INVALID_QUANTITY');
  }
  const total = unitMinor * quantity;
  assertMinor(total);
  return total;
}

/** Round half-up to the nearest kuruş for percentage-priced add-ons. */
export function percentageOfMinor(baseMinor: number, percentage: string | number) {
  assertMinor(baseMinor, true);
  const basisPoints = decimalPercentToBasisPoints(percentage);
  const result = Math.floor((baseMinor * basisPoints + 5_000) / 10_000);
  assertMinor(result, true);
  return result;
}

export function assertCurrency(value: string): asserts value is typeof TRY_CURRENCY {
  if (value !== TRY_CURRENCY && value !== 'TL') {
    throw new MoneyError('MONEY_CURRENCY_MISMATCH');
  }
}

function normalizeDecimal(value: string | number) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0 || value >= 1e12) {
      throw new MoneyError('MONEY_INVALID_DECIMAL');
    }
    const fixed = value.toFixed(2);
    if (Number(fixed) !== value) throw new MoneyError('MONEY_TOO_PRECISE');
    return fixed;
  }
  return value.trim();
}

function decimalPercentToBasisPoints(value: string | number) {
  const normalized = typeof value === 'number' ? value.toFixed(2) : value.trim();
  const match = /^(\d{1,3})(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) throw new MoneyError('MONEY_INVALID_PERCENTAGE');
  const basisPoints = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  if (basisPoints > 100_000) throw new MoneyError('MONEY_INVALID_PERCENTAGE');
  return basisPoints;
}

function assertMinor(value: number, allowZero = false) {
  if (!Number.isSafeInteger(value)) throw new MoneyError('MONEY_OVERFLOW');
  if (value > MAX_PAYMENT_MINOR) throw new MoneyError('MONEY_LIMIT_EXCEEDED');
  if (value < 0 || (!allowZero && value === 0)) {
    throw new MoneyError('MONEY_MUST_BE_POSITIVE');
  }
}
