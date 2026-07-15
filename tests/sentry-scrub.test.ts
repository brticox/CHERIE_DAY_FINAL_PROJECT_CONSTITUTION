import { describe, expect, it } from 'vitest';

import { scrubSentryEvent } from '@/lib/observability/sentry';

describe('Sentry privacy scrubbing', () => {
  it('removes PII, credentials, query strings, and sensitive extra fields', () => {
    const event = scrubSentryEvent({
      type: undefined,
      user: { email: 'customer@example.com', ip_address: '127.0.0.1' },
      request: {
        url: 'https://staging.cherieday.eu/auth/callback?code=oauth-code',
        query_string: 'code=oauth-code',
        cookies: { session: 'secret-cookie' },
        headers: { authorization: 'Bearer secret', 'user-agent': 'test' },
        data: { password: 'secret-password', safe: 'ok' },
      },
      extra: {
        email: 'customer@example.com',
        provider_payload: { card: 'raw' },
        result: 'safe-staging-smoke',
      },
    });

    expect(event.user).toBeUndefined();
    expect(event.request?.url).toBe('https://staging.cherieday.eu/auth/callback');
    expect(event.request?.query_string).toBeUndefined();
    expect(event.request?.cookies).toBeUndefined();
    expect(event.request?.headers?.authorization).toBe('[GİZLENDİ]');
    expect(event.request?.data).toEqual({ password: '[GİZLENDİ]', safe: 'ok' });
    expect(event.extra).toEqual({
      email: '[GİZLENDİ]',
      provider_payload: '[GİZLENDİ]',
      result: 'safe-staging-smoke',
    });
  });
});
