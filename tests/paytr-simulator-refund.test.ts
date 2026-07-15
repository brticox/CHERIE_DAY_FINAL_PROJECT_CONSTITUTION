import { describe, expect, it, vi } from 'vitest';

import { parsePaytrCallbackBody } from '@/lib/payments/paytr-callback';
import { verifyPaytrCallbackHash } from '@/lib/payments/paytr-crypto';
import {
  assertPaytrSimulatorEnvironment,
  simulatePaytrCallback,
} from '@/lib/payments/paytr-simulator';
import { PaytrRefundProvider, SimulatedRefundProvider } from '@/lib/payments/refunds';

const credentials = { merchantId: 'merchant', merchantKey: 'key', merchantSalt: 'salt' };

describe('local PayTR simulator', () => {
  it.each(['success', 'failure', 'wrong_amount', 'unknown_order'] as const)(
    'generates parseable %s callbacks',
    (scenario) => {
      const parsed = parsePaytrCallbackBody(
        'application/x-www-form-urlencoded',
        simulatePaytrCallback({
          credentials,
          scenario,
          merchantOrderId: 'ORDERA1',
          paymentAmountMinor: 10000,
        }),
      );
      expect(
        verifyPaytrCallbackHash(credentials, {
          merchantOrderId: parsed.merchantOrderId,
          status: parsed.status,
          totalAmount: parsed.totalAmount,
          hash: parsed.hash,
        }),
      ).toBe(true);
    },
  );

  it('generates invalid signatures and hardened malformed/oversized cases', () => {
    const invalid = parsePaytrCallbackBody(
      'application/x-www-form-urlencoded',
      simulatePaytrCallback({
        credentials,
        scenario: 'invalid_signature',
        merchantOrderId: 'ORDERA1',
        paymentAmountMinor: 10000,
      }),
    );
    expect(
      verifyPaytrCallbackHash(credentials, {
        merchantOrderId: invalid.merchantOrderId,
        status: invalid.status,
        totalAmount: invalid.totalAmount,
        hash: invalid.hash,
      }),
    ).toBe(false);
    for (const scenario of ['missing_fields', 'malformed', 'oversized'] as const) {
      expect(() =>
        parsePaytrCallbackBody(
          'application/x-www-form-urlencoded',
          simulatePaytrCallback({
            credentials,
            scenario,
            merchantOrderId: 'ORDERA1',
            paymentAmountMinor: 10000,
          }),
        ),
      ).toThrow();
    }
  });

  it('cannot run in production or without an internal secret', () => {
    expect(() =>
      assertPaytrSimulatorEnvironment({
        APP_ENV: 'production',
        PAYTR_SIMULATOR_SECRET: 'x'.repeat(20),
      }),
    ).toThrow('PAYTR_SIMULATOR_FORBIDDEN_IN_PRODUCTION');
    expect(() => assertPaytrSimulatorEnvironment({ APP_ENV: 'development' })).toThrow(
      'PAYTR_SIMULATOR_SECRET_REQUIRED',
    );
  });
});

describe('refund provider adapters', () => {
  it('simulates success, failure and retryable timeout without network', async () => {
    await expect(
      new SimulatedRefundProvider('success').submit({
        merchantOrderId: 'ORDERA1',
        amountMinor: 2500,
        idempotencyKey: 'refund-key-123456',
      }),
    ).resolves.toMatchObject({ succeeded: true });
    await expect(
      new SimulatedRefundProvider('failure').submit({
        merchantOrderId: 'ORDERA1',
        amountMinor: 2500,
        idempotencyKey: 'refund-key-123456',
      }),
    ).resolves.toMatchObject({ succeeded: false, retryable: false });
    await expect(
      new SimulatedRefundProvider('timeout').submit({
        merchantOrderId: 'ORDERA1',
        amountMinor: 2500,
        idempotencyKey: 'refund-key-123456',
      }),
    ).resolves.toMatchObject({ succeeded: false, retryable: true });
  });

  it('builds the official sandbox refund request through an injected transport', async () => {
    const transport = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = init?.body as URLSearchParams;
      expect(body.get('return_amount')).toBe('25.00');
      expect(body.get('paytr_token')).toBeTruthy();
      return new Response(
        JSON.stringify({ status: 'success', reference_no: 'SIMREF1' }),
        { status: 200 },
      );
    });
    const provider = new PaytrRefundProvider(credentials, transport as typeof fetch, {
      APP_ENV: 'development',
      PAYTR_TEST_MODE: '1',
      PAYTR_REFUND_ENABLED: 'true',
    });
    await expect(
      provider.submit({
        merchantOrderId: 'ORDERA1',
        amountMinor: 2500,
        idempotencyKey: 'refund-key-123456',
      }),
    ).resolves.toEqual({
      succeeded: true,
      providerReference: 'SIMREF1',
      retryable: false,
    });
  });

  it('refuses real provider submission unless sandbox is explicitly enabled', async () => {
    const provider = new PaytrRefundProvider(
      credentials,
      vi.fn() as unknown as typeof fetch,
      { APP_ENV: 'development', PAYTR_TEST_MODE: '1' },
    );
    await expect(
      provider.submit({
        merchantOrderId: 'ORDERA1',
        amountMinor: 2500,
        idempotencyKey: 'refund-key-123456',
      }),
    ).rejects.toThrow('PAYTR_REFUND_DISABLED');
  });
});
