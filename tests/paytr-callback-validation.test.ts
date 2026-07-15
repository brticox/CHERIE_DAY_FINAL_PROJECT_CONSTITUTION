import { describe, expect, it } from 'vitest';

import {
  parsePaytrCallbackBody,
  PaytrCallbackError,
} from '@/lib/payments/paytr-callback';

const valid = new URLSearchParams({
  merchant_oid: 'CD260714000123A1',
  status: 'success',
  total_amount: '265090',
  hash: 'KIbIvaPDZdnHm8BcQUrYlBsQW/dHb86ymJMmUNSePRQ=',
  payment_type: 'card',
  currency: 'TL',
  payment_amount: '255090',
  test_mode: '1',
}).toString();

describe('PayTR callback boundary validation', () => {
  it('parses the documented form and strips hash/failure message from persistence', () => {
    const parsed = parsePaytrCallbackBody('application/x-www-form-urlencoded', valid);
    expect(parsed.paymentAmountMinor).toBe(255090);
    expect(parsed.totalAmountMinor).toBe(265090);
    expect(parsed.safePayload).not.toHaveProperty('hash');
    expect(parsed.safePayload).not.toHaveProperty('failed_reason_msg');
  });

  it.each([
    ['multipart/form-data', valid, 'UNSUPPORTED_CONTENT_TYPE'],
    ['application/x-www-form-urlencoded', `${valid}&status=failed`, 'DUPLICATE_FIELD'],
    ['application/x-www-form-urlencoded', `${valid}&surprise=1`, 'UNEXPECTED_FIELD'],
    [
      'application/x-www-form-urlencoded',
      valid.replace('currency=TL', 'currency=USD'),
      'CURRENCY_MISMATCH',
    ],
    [
      'application/x-www-form-urlencoded',
      valid.replace('status=success', 'status=pending'),
      'INVALID_STATUS',
    ],
    [
      'application/x-www-form-urlencoded',
      valid.replace('payment_amount=255090', 'payment_amount=0'),
      'INVALID_AMOUNT',
    ],
  ])('rejects %s / %s', (contentType, body, code) => {
    expect(() => parsePaytrCallbackBody(contentType, body)).toThrowError(
      expect.objectContaining<Partial<PaytrCallbackError>>({ code }),
    );
  });

  it('rejects an oversized body even without Content-Length', () => {
    expect(() =>
      parsePaytrCallbackBody(
        'application/x-www-form-urlencoded',
        `${valid}&${'x'.repeat(65_536)}`,
      ),
    ).toThrowError(expect.objectContaining({ code: 'PAYLOAD_TOO_LARGE' }));
  });
});
