import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { withSentryConfig } from '@sentry/nextjs';

import { supabaseImageRemotePatterns } from './lib/media/next-image.mjs';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function origin(value) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function contentSecurityPolicy(isProduction) {
  const supabaseOrigin = origin(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const sentryOrigin = origin(process.env.NEXT_PUBLIC_SENTRY_DSN);
  const connect = ["'self'", supabaseOrigin, sentryOrigin]
    .filter(Boolean)
    .join(' ');
  const images = ["'self'", 'data:', 'blob:', supabaseOrigin].filter(Boolean).join(' ');
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${images}`,
    "font-src 'self' data:",
    `connect-src ${connect}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "frame-src 'self' https://www.paytr.com https://*.paytr.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    isProduction ? 'upgrade-insecure-requests' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // A stray lockfile exists in a parent dir; pin the tracing root to this project.
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: supabaseImageRemotePatterns(process.env.NEXT_PUBLIC_SUPABASE_URL),
  },

  // Turkish-first canonical URLs. Legacy English top-level paths 301 → Turkish.
  // These are the ONLY live public top-level surfaces; no duplicated English routes.
  async redirects() {
    return [
      { source: '/shop', destination: '/magaza', permanent: true },
      { source: '/shop/:path*', destination: '/magaza/:path*', permanent: true },
      { source: '/collections', destination: '/koleksiyonlar', permanent: true },
      {
        source: '/collections/:path*',
        destination: '/koleksiyonlar/:path*',
        permanent: true,
      },
      { source: '/experiences', destination: '/deneyimler', permanent: true },
      {
        source: '/experiences/:path*',
        destination: '/deneyimler/:path*',
        permanent: true,
      },
      { source: '/digital', destination: '/dijital', permanent: true },
      { source: '/digital/:path*', destination: '/dijital/:path*', permanent: true },
      { source: '/memory', destination: '/hatira', permanent: true },
      { source: '/memory/:path*', destination: '/hatira/:path*', permanent: true },
      { source: '/planning', destination: '/planlama', permanent: true },
      { source: '/planning/:path*', destination: '/planlama/:path*', permanent: true },
      // Turkish label alignment + legacy fragments (docs/40 §6)
      { source: '/contact', destination: '/iletisim', permanent: true },
      { source: '/faq', destination: '/sss', permanent: true },
      { source: '/quote-request', destination: '/teklif', permanent: true },
    ];
  },
  async headers() {
    const isProduction = process.env.APP_ENV === 'production';
    const isSecureProduction =
      isProduction && origin(process.env.NEXT_PUBLIC_SITE_URL)?.startsWith('https://');
    const csp = contentSecurityPolicy(Boolean(isSecureProduction));

    // Staging/preview stay unindexed; Production drops the noindex tag.
    const stagingHeaders = isProduction
      ? []
      : [
          {
            source: '/:path*',
            headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
          },
        ];

    // A complete allowlist covers browser-side resources. Server-only Resend and
    // payment calls never need CSP access; Supabase/Sentry origins are exact.
    const securityHeaders = [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: csp },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];

    // HSTS only in Production (avoids pinning preview/staging hostnames).
    const productionHeaders = isSecureProduction
      ? [
          {
            source: '/:path*',
            headers: [
              {
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
              },
            ],
          },
        ]
      : [];

    return [
      ...stagingHeaders,
      ...securityHeaders,
      ...productionHeaders,
      {
        source: '/auth/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  telemetry: false,
  webpack: { treeshake: { removeDebugLogging: true } },
  sourcemaps: {
    // Source-map upload stays disabled until an explicitly approved token exists.
    disable: !process.env.SENTRY_AUTH_TOKEN,
    deleteSourcemapsAfterUpload: true,
  },
});
