import { describe, expect, it } from 'vitest';

import { validatePaytrEnvironment } from '@/lib/payments/environment';

const sandbox = {
  PAYTR_MERCHANT_ID: 'test-id',
  PAYTR_MERCHANT_KEY: 'test-key',
  PAYTR_MERCHANT_SALT: 'test-salt',
  PAYTR_TEST_MODE: '1',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  APP_ENV: 'development',
};

describe('payment environment readiness', () => {
  it('accepts explicit local sandbox configuration', () => {
    expect(validatePaytrEnvironment(sandbox).ready).toBe(true);
  });

  it('rejects missing credentials', () => {
    expect(
      validatePaytrEnvironment({ ...sandbox, PAYTR_MERCHANT_KEY: '' }).failures,
    ).toContain('PAYTR_CREDENTIALS_MISSING');
  });

  it('rejects live mode on localhost and outside production', () => {
    const report = validatePaytrEnvironment({ ...sandbox, PAYTR_TEST_MODE: '0' });
    expect(report.failures).toContain('PAYTR_LIVE_ON_LOCALHOST_FORBIDDEN');
    expect(report.failures).toContain('PAYTR_LIVE_ENVIRONMENT_MISMATCH');
  });

  it('rejects sandbox credentials, simulator and recipient override in production', () => {
    const report = validatePaytrEnvironment({
      ...sandbox,
      APP_ENV: 'production',
      NEXT_PUBLIC_SITE_URL: 'https://example.test',
      PAYTR_SIMULATOR_SECRET: 'local-only',
      NOTIFICATION_RECIPIENT_OVERRIDE: 'capture@example.test',
    });
    expect(report.failures).toEqual(
      expect.arrayContaining([
        'PAYTR_TEST_CREDENTIALS_IN_PRODUCTION',
        'PAYTR_SIMULATOR_FORBIDDEN_IN_PRODUCTION',
        'PAYMENT_RECIPIENT_OVERRIDE_FORBIDDEN',
      ]),
    );
  });

  it('requires a worker secret and disables refund simulation in production', () => {
    const report = validatePaytrEnvironment({
      ...sandbox,
      APP_ENV: 'production',
      PAYTR_TEST_MODE: '0',
      NEXT_PUBLIC_SITE_URL: 'https://example.test',
      PAYTR_REFUND_SIMULATOR_ENABLED: 'true',
    });

    expect(report.failures).toContain('PAYMENT_WORKER_SECRET_MISSING');
    expect(report.failures).toContain('PAYTR_REFUND_SIMULATOR_FORBIDDEN_IN_PRODUCTION');
  });
});
