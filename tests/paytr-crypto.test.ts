import { describe, expect, it } from 'vitest';

import {
  createPaytrCallbackHash,
  createPaytrRefundToken,
  createPaytrStatusQueryToken,
  createPaytrToken,
  encodePaytrBasket,
  verifyPaytrCallbackHash,
} from '@/lib/payments/paytr-crypto';

const credentials = {
  merchantId: '123456',
  merchantKey: 'test-key-789',
  merchantSalt: 'test-salt-456',
};

const basket = encodePaytrBasket([
  { name: 'Düğün Davetiyesi İstanbul', unitPriceDecimal: '1250.50', quantity: 2 },
  { name: 'Kurdelâ', unitPriceDecimal: '49.90', quantity: 1 },
]);

describe('PayTR official-contract known-answer vectors', () => {
  it('encodes Unicode and Turkish basket content as UTF-8 base64', () => {
    expect(basket).toBe(
      'W1siRMO8xJ/DvG4gRGF2ZXRpeWVzaSDEsHN0YW5idWwiLCIxMjUwLjUwIiwyXSxbIkt1cmRlbMOiIiwiNDkuOTAiLDFdXQ==',
    );
    expect(Buffer.from(basket, 'base64').toString('utf8')).toContain('İstanbul');
  });

  it('matches the independently calculated initialization vector', () => {
    const token = createPaytrToken(credentials, {
      userIp: '203.0.113.7',
      merchantOrderId: 'CD260714000123',
      email: 'buyer@example.com',
      paymentAmountMinor: 255090,
      basketBase64: basket,
      noInstallment: '0',
      maxInstallment: '6',
      currency: 'TL',
      testMode: '1',
    });
    expect(token).toBe('Cv069/mCXCl9tuW7+eF8JagiuoiteUggx7lCFrq2z1k=');
  });

  it('changes for every signed input or secret change', () => {
    const base = {
      userIp: '203.0.113.7', merchantOrderId: 'CD260714000123',
      email: 'buyer@example.com', paymentAmountMinor: 255090,
      basketBase64: basket, noInstallment: '0' as const, maxInstallment: '6',
      currency: 'TL' as const, testMode: '1' as const,
    };
    const token = createPaytrToken(credentials, base);
    expect(createPaytrToken(credentials, { ...base, email: 'buyer2@example.com' })).not.toBe(token);
    expect(createPaytrToken({ ...credentials, merchantKey: 'wrong' }, base)).not.toBe(token);
    expect(createPaytrToken({ ...credentials, merchantSalt: 'wrong' }, base)).not.toBe(token);
  });

  it('matches and verifies the callback vector using canonical base64 only', () => {
    const fields = {
      merchantOrderId: 'CD260714000123', status: 'success', totalAmount: '265090',
    };
    const hash = createPaytrCallbackHash(credentials, fields);
    expect(hash).toBe('KIbIvaPDZdnHm8BcQUrYlBsQW/dHb86ymJMmUNSePRQ=');
    expect(verifyPaytrCallbackHash(credentials, { ...fields, hash })).toBe(true);
    expect(verifyPaytrCallbackHash(credentials, { ...fields, hash: `${hash}!` })).toBe(false);
    expect(verifyPaytrCallbackHash(credentials, { ...fields, hash: 'not-base64' })).toBe(false);
    expect(verifyPaytrCallbackHash(credentials, { ...fields, hash: hash.slice(0, -1) })).toBe(false);
  });

  it('matches refund and status-query vectors', () => {
    expect(createPaytrRefundToken(credentials, 'CD260714000123', '125.50')).toBe(
      'lXS9IBRuGz1EuEmznKuR7BzPIvCpwt0kTDIobPzJL+4=',
    );
    expect(createPaytrStatusQueryToken(credentials, 'CD260714000123')).toBe(
      '3G8Y+o9MvGwUlRPc8HuGKoGZHrZpsa/0GsPMm7ZJNQw=',
    );
  });
});
