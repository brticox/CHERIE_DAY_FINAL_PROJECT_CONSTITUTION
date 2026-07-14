import { afterEach, describe, expect, it, vi } from 'vitest';

import { authCallbackUrl, authReadiness, getAuthConfig } from '@/lib/auth/config';

afterEach(() => vi.unstubAllEnvs());

describe('kimlik ortam yapılandırması', () => {
  it('yerel sağlayıcıları varsayılan olarak kapalı tutar', () => {
    vi.stubEnv('APP_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    vi.stubEnv('AUTH_REDIRECT_ORIGINS', 'http://localhost:3000');
    vi.stubEnv('AUTH_GOOGLE_ENABLED', 'false');
    vi.stubEnv('AUTH_APPLE_ENABLED', 'false');
    expect(authReadiness()).toEqual({
      valid: true,
      providers: { google: false, apple: false },
    });
  });

  it('üretimde localhost adresini reddeder', () => {
    vi.stubEnv('APP_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    expect(() => getAuthConfig()).toThrow();
  });

  it('callback adresine yalnız güvenli iç sonraki yolu taşır', () => {
    vi.stubEnv('APP_ENV', 'preview');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.example.test');
    const callback = new URL(authCallbackUrl('/hesap/siparisler', 'google'));
    expect(callback.origin).toBe('https://staging.example.test');
    expect(callback.pathname).toBe('/auth/callback');
    expect(callback.searchParams.get('next')).toBe('/hesap/siparisler');
  });
});
