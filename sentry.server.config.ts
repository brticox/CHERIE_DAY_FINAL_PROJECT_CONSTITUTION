import * as Sentry from '@sentry/nextjs';

import {
  scrubSentryBreadcrumb,
  scrubSentryEvent,
  sentryEnvironment,
  sentryRelease,
} from '@/lib/observability/sentry';

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: sentryEnvironment === 'staging' && Boolean(dsn),
  environment: sentryEnvironment,
  release: sentryRelease,
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
  beforeBreadcrumb: scrubSentryBreadcrumb,
  beforeSend: scrubSentryEvent,
});
