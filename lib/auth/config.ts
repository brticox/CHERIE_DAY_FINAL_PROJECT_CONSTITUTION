import 'server-only';

import { z } from 'zod';

export type CustomerAuthProvider = 'google' | 'apple';

const schema = z.object({
  APP_ENV: z.enum(['development', 'preview', 'production']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  AUTH_REDIRECT_ORIGINS: z.string().optional(),
  AUTH_GOOGLE_ENABLED: z.enum(['true', 'false']).default('false'),
  AUTH_APPLE_ENABLED: z.enum(['true', 'false']).default('false'),
});

export function getAuthConfig() {
  const value = schema.parse(process.env);
  const siteUrl = new URL(value.NEXT_PUBLIC_SITE_URL);
  const allowedOrigins = new Set(
    (value.AUTH_REDIRECT_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  allowedOrigins.add(siteUrl.origin);

  if (value.APP_ENV === 'production') {
    if (siteUrl.protocol !== 'https:' || siteUrl.hostname === 'localhost') {
      throw new Error('Üretim kimlik yapılandırması güvenli HTTPS adresi gerektirir.');
    }
    for (const origin of allowedOrigins) {
      const parsed = new URL(origin);
      if (parsed.protocol !== 'https:' || parsed.hostname === 'localhost') {
        throw new Error('Üretim yönlendirme listesinde güvenli olmayan adres var.');
      }
    }
  }

  return {
    environment: value.APP_ENV,
    siteUrl,
    allowedOrigins: [...allowedOrigins],
    providers: {
      google: value.AUTH_GOOGLE_ENABLED === 'true',
      apple: value.AUTH_APPLE_ENABLED === 'true',
    },
  };
}

export function authReadiness() {
  try {
    const config = getAuthConfig();
    return { valid: true, providers: config.providers } as const;
  } catch {
    return { valid: false, providers: { google: false, apple: false } } as const;
  }
}

export function authCallbackUrl(next: string, provider: CustomerAuthProvider) {
  const { siteUrl } = getAuthConfig();
  const callback = new URL('/auth/callback', siteUrl);
  callback.searchParams.set('next', next);
  callback.searchParams.set('provider', provider);
  return callback.toString();
}
