import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { withSentryConfig } from '@sentry/nextjs';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // A stray lockfile exists in a parent dir; pin the tracing root to this project.
  outputFileTracingRoot: projectRoot,

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
    const stagingHeaders =
      process.env.APP_ENV === 'production'
        ? []
        : [
            {
              source: '/:path*',
              headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
            },
          ];

    return [
      ...stagingHeaders,
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
