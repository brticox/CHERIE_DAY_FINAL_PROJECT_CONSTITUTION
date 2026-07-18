import { createHmac, randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { verifyResendWebhook } from '@/lib/notifications/resend-webhook';

function fixture(overrides?: { timestamp?: string; signature?: string }) {
  const key = randomBytes(32);
  const secret = `whsec_${key.toString('base64')}`;
  const id = 'evt_test_1';
  const timestamp = overrides?.timestamp ?? '1';
  const payload = JSON.stringify({
    type: 'email.delivered',
    created_at: '2026-07-14T18:00:00.000Z',
    data: { email_id: 'email_test_1', to: ['masked@example.test'] },
  });
  const signature =
    overrides?.signature ??
    `v1,${createHmac('sha256', key).update(`${id}.${timestamp}.${payload}`).digest('base64')}`;
  return { payload, secret, headers: { id, timestamp, signature } };
}

describe('Resend webhook doğrulaması', () => {
  it('geçerli imzayı kabul eder ve yalnız gerekli alanları döndürür', () => {
    const value = fixture();
    expect(
      verifyResendWebhook(value.payload, value.headers, value.secret, 1000).type,
    ).toBe('email.delivered');
  });

  it('sahte imzayı reddeder', () => {
    const value = fixture({ signature: 'v1,ZmFrZQ==' });
    expect(() =>
      verifyResendWebhook(value.payload, value.headers, value.secret, 1000),
    ).toThrow();
  });

  it('beş dakikadan eski isteği reddeder', () => {
    const value = fixture();
    expect(() =>
      verifyResendWebhook(value.payload, value.headers, value.secret, 302_000),
    ).toThrow();
  });
});
