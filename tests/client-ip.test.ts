import { describe, expect, it } from 'vitest';

import { trustedClientIp } from '@/lib/security/client-ip';

describe('trusted payment client identity', () => {
  it('accepts the platform-owned Vercel forwarding header', () => {
    expect(
      trustedClientIp(new Headers({ 'x-vercel-forwarded-for': '203.0.113.9' }), {
        NODE_ENV: 'production',
      }),
    ).toBe('203.0.113.9');
  });

  it('ignores generic forwarding headers unless a trusted proxy is configured', () => {
    const headers = new Headers({ 'x-forwarded-for': '198.51.100.7' });
    expect(() => trustedClientIp(headers, { NODE_ENV: 'production' })).toThrow(
      'TRUSTED_CLIENT_IP_UNAVAILABLE',
    );
    expect(
      trustedClientIp(headers, {
        NODE_ENV: 'production',
        TRUST_PROXY_HEADERS: 'true',
      }),
    ).toBe('198.51.100.7');
  });

  it('rejects malformed forwarding values', () => {
    expect(() =>
      trustedClientIp(new Headers({ 'x-vercel-forwarded-for': 'spoofed' }), {
        NODE_ENV: 'production',
      }),
    ).toThrow('TRUSTED_CLIENT_IP_UNAVAILABLE');
  });
});
