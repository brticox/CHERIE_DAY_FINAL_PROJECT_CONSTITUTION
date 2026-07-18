import { MoneyError, tryToMinor } from './money';

const MAX_CALLBACK_BYTES = 65_536;
const MAX_FIELDS = 16;
const REQUIRED = [
  'merchant_oid',
  'status',
  'total_amount',
  'hash',
  'payment_type',
  'currency',
  'payment_amount',
] as const;
const ALLOWED = new Set([
  ...REQUIRED,
  'failed_reason_code',
  'failed_reason_msg',
  'test_mode',
]);

export class PaytrCallbackError extends Error {
  constructor(
    public readonly code: string,
    public readonly httpStatus = 400,
  ) {
    super(code);
    this.name = 'PaytrCallbackError';
  }
}

export type ParsedPaytrCallback = {
  merchantOrderId: string;
  status: 'success' | 'failed';
  totalAmount: string;
  totalAmountMinor: number;
  paymentAmountMinor: number;
  hash: string;
  paymentType: 'card' | 'eft';
  currency: 'TL';
  failedReasonCode: string | null;
  testMode: '0' | '1' | null;
  safePayload: Record<string, string>;
};

export function parsePaytrCallbackBody(
  contentType: string | null,
  body: string,
): ParsedPaytrCallback {
  if (!contentType?.toLowerCase().startsWith('application/x-www-form-urlencoded')) {
    throw new PaytrCallbackError('UNSUPPORTED_CONTENT_TYPE', 415);
  }
  if (Buffer.byteLength(body, 'utf8') > MAX_CALLBACK_BYTES) {
    throw new PaytrCallbackError('PAYLOAD_TOO_LARGE', 413);
  }
  const form = new URLSearchParams(body);
  const keys = [...form.keys()];
  if (keys.length > MAX_FIELDS) throw new PaytrCallbackError('TOO_MANY_FIELDS');
  if (keys.some((key) => !ALLOWED.has(key))) {
    throw new PaytrCallbackError('UNEXPECTED_FIELD');
  }
  for (const key of new Set(keys)) {
    if (form.getAll(key).length !== 1) throw new PaytrCallbackError('DUPLICATE_FIELD');
  }
  for (const key of REQUIRED) {
    if (!form.get(key)) throw new PaytrCallbackError('MISSING_FIELD');
  }

  const merchantOrderId = form.get('merchant_oid')!;
  const status = form.get('status')!;
  const totalAmount = form.get('total_amount')!;
  const paymentAmount = form.get('payment_amount')!;
  const hash = form.get('hash')!;
  const paymentType = form.get('payment_type')!;
  const currency = form.get('currency')!;
  const testMode = form.get('test_mode');
  const failedReasonCode = form.get('failed_reason_code');

  if (!/^[A-Za-z0-9]{1,64}$/.test(merchantOrderId)) {
    throw new PaytrCallbackError('INVALID_MERCHANT_ORDER_ID');
  }
  if (status !== 'success' && status !== 'failed') {
    throw new PaytrCallbackError('INVALID_STATUS');
  }
  if (!/^\d{1,13}$/.test(totalAmount) || !/^\d{1,13}$/.test(paymentAmount)) {
    throw new PaytrCallbackError('INVALID_AMOUNT');
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(hash) || hash.length > 128) {
    throw new PaytrCallbackError('INVALID_HASH');
  }
  if (paymentType !== 'card' && paymentType !== 'eft') {
    throw new PaytrCallbackError('INVALID_PAYMENT_TYPE');
  }
  if (currency !== 'TL') throw new PaytrCallbackError('CURRENCY_MISMATCH', 409);
  if (testMode !== null && testMode !== '0' && testMode !== '1') {
    throw new PaytrCallbackError('INVALID_TEST_MODE');
  }
  if (failedReasonCode && !/^[A-Za-z0-9_-]{1,40}$/.test(failedReasonCode)) {
    throw new PaytrCallbackError('INVALID_FAILURE_CODE');
  }

  let totalAmountMinor: number;
  let paymentAmountMinor: number;
  try {
    totalAmountMinor = minorInteger(totalAmount);
    paymentAmountMinor = minorInteger(paymentAmount);
  } catch (error) {
    if (error instanceof MoneyError) throw new PaytrCallbackError('INVALID_AMOUNT');
    throw error;
  }
  if (status === 'success' && totalAmountMinor < paymentAmountMinor) {
    throw new PaytrCallbackError('INVALID_CAPTURED_TOTAL');
  }

  const safePayload = Object.fromEntries(
    [
      ['merchant_oid', merchantOrderId],
      ['status', status],
      ['total_amount', totalAmount],
      ['payment_amount', paymentAmount],
      ['payment_type', paymentType],
      ['currency', currency],
      ['test_mode', testMode],
      ['failed_reason_code', failedReasonCode],
    ].filter((entry): entry is [string, string] => entry[1] !== null),
  );
  return {
    merchantOrderId,
    status,
    totalAmount,
    totalAmountMinor,
    paymentAmountMinor,
    hash,
    paymentType,
    currency,
    failedReasonCode,
    testMode,
    safePayload,
  };
}

function minorInteger(value: string) {
  const integer = Number(value);
  if (!Number.isSafeInteger(integer)) throw new MoneyError('MONEY_OVERFLOW');
  // Reuse the global payment ceiling and positive-value invariant.
  tryToMinor(`${Math.floor(integer / 100)}.${String(integer % 100).padStart(2, '0')}`);
  return integer;
}
