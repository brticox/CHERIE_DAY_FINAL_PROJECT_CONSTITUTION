import * as Sentry from '@sentry/nextjs';

import {
  scrubSentryBreadcrumb,
  scrubSentryEvent,
  sentryRelease,
} from '@/lib/observability/sentry';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const staging = process.env.NEXT_PUBLIC_SITE_URL === 'https://staging.cherieday.eu';

Sentry.init({
  dsn,
  enabled: staging && Boolean(dsn),
  environment: staging ? 'staging' : 'development',
  release: sentryRelease,
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeBreadcrumb: scrubSentryBreadcrumb,
  beforeSend: scrubSentryEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
