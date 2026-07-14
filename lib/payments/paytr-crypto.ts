import { createHmac, timingSafeEqual } from 'node:crypto';

export type PaytrCredentials = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
};

export type PaytrTokenFields = {
  userIp: string;
  merchantOrderId: string;
  email: string;
  paymentAmountMinor: number;
  basketBase64: string;
  noInstallment: '0' | '1';
  maxInstallment: string;
  currency: 'TL' | 'TRY';
  testMode: '0' | '1';
};

export function createPaytrToken(
  credentials: PaytrCredentials,
  fields: PaytrTokenFields,
) {
  const source =
    credentials.merchantId +
    fields.userIp +
    fields.merchantOrderId +
    fields.email +
    String(fields.paymentAmountMinor) +
    fields.basketBase64 +
    fields.noInstallment +
    fields.maxInstallment +
    fields.currency +
    fields.testMode +
    credentials.merchantSalt;
  return hmacBase64(credentials.merchantKey, source);
}

export function createPaytrCallbackHash(
  credentials: Pick<PaytrCredentials, 'merchantKey' | 'merchantSalt'>,
  fields: { merchantOrderId: string; status: string; totalAmount: string },
) {
  return hmacBase64(
    credentials.merchantKey,
    fields.merchantOrderId + credentials.merchantSalt + fields.status + fields.totalAmount,
  );
}

export function verifyPaytrCallbackHash(
  credentials: Pick<PaytrCredentials, 'merchantKey' | 'merchantSalt'>,
  fields: { merchantOrderId: string; status: string; totalAmount: string; hash: string },
) {
  const actual = decodeCanonicalBase64(fields.hash);
  if (!actual) return false;
  const expected = Buffer.from(createPaytrCallbackHash(credentials, fields), 'base64');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createPaytrRefundToken(
  credentials: PaytrCredentials,
  merchantOrderId: string,
  returnAmountDecimal: string,
) {
  return hmacBase64(
    credentials.merchantKey,
    credentials.merchantId +
      merchantOrderId +
      returnAmountDecimal +
      credentials.merchantSalt,
  );
}

export function createPaytrStatusQueryToken(
  credentials: PaytrCredentials,
  merchantOrderId: string,
) {
  return hmacBase64(
    credentials.merchantKey,
    credentials.merchantId + merchantOrderId + credentials.merchantSalt,
  );
}

export function encodePaytrBasket(
  items: ReadonlyArray<{ name: string; unitPriceDecimal: string; quantity: number }>,
) {
  return Buffer.from(
    JSON.stringify(
      items.map((item) => [item.name, item.unitPriceDecimal, item.quantity]),
    ),
    'utf8',
  ).toString('base64');
}

function hmacBase64(key: string, value: string) {
  return createHmac('sha256', key).update(value, 'utf8').digest('base64');
}

function decodeCanonicalBase64(value: string) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) return null;
  try {
    const decoded = Buffer.from(value, 'base64');
    return decoded.toString('base64') === value ? decoded : null;
  } catch {
    return null;
  }
}
