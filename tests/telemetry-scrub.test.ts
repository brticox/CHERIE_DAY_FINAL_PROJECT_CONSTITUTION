import { describe, expect, it } from 'vitest';

import { scrubTelemetry } from '@/lib/observability/scrub';

describe('telemetri gizleme', () => {
  it('kimlik, e-posta ve ödeme gövdelerini kaldırır', () => {
    expect(
      scrubTelemetry({
        authorization: 'Bearer secret',
        nested: {
          email: 'customer@example.test',
          code: 'oauth-code',
          safe: 'callback_failed',
        },
        paymentPayload: { pan: '4111111111111111' },
      }),
    ).toEqual({
      authorization: '[GİZLENDİ]',
      nested: { email: '[GİZLENDİ]', code: '[GİZLENDİ]', safe: 'callback_failed' },
      paymentPayload: '[GİZLENDİ]',
    });
  });
});
