import { afterEach, describe, expect, it } from 'vitest';

import { supabaseImageRemotePatterns } from '@/lib/media/next-image.mjs';
import { authorizeInternalRequest } from '@/lib/security/internal-auth';
import { localSeedFallback, PublicDataSourceError } from '@/lib/data/source';

const envSnapshot = { ...process.env };

afterEach(() => {
  process.env = { ...envSnapshot };
});

describe('launch blocker hardening', () => {
  it('allows only the configured public Supabase media bucket for next/image', () => {
    expect(supabaseImageRemotePatterns('https://project-ref.supabase.co')).toEqual([
      {
        protocol: 'https',
        hostname: 'project-ref.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/public-media/**',
      },
    ]);
    expect(supabaseImageRemotePatterns('not-a-url')).toEqual([]);
  });

  it('accepts Vercel CRON_SECRET even when a scoped worker secret also exists', () => {
    process.env.NOTIFICATION_WORKER_SECRET = 'notification-only-secret';
    process.env.CRON_SECRET = 'vercel-cron-secret';

    expect(authorizeInternalRequest('Bearer vercel-cron-secret', 'notification')).toBe(
      true,
    );
    expect(
      authorizeInternalRequest('Bearer notification-only-secret', 'notification'),
    ).toBe(true);
    expect(authorizeInternalRequest('Bearer wrong-secret', 'notification')).toBe(false);
  });

  it('does not let one worker-specific secret authorize the other worker', () => {
    delete process.env.CRON_SECRET;
    delete process.env.INTERNAL_CRON_SECRET;
    process.env.NOTIFICATION_WORKER_SECRET = 'notification-only-secret';
    process.env.PAYMENT_WORKER_SECRET = 'payment-only-secret';

    expect(authorizeInternalRequest('Bearer notification-only-secret', 'payment')).toBe(
      false,
    );
  });

  it('permits seed fixtures locally but fails closed in hosted environments', () => {
    process.env.APP_ENV = 'development';
    expect(localSeedFallback('products_public', [{ id: 'seed' }])).toEqual([
      { id: 'seed' },
    ]);

    process.env.APP_ENV = 'production';
    expect(() => localSeedFallback('products_public', [{ id: 'seed' }])).toThrow(
      PublicDataSourceError,
    );
  });
});
