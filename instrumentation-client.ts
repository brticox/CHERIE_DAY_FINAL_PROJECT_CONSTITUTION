import {
  scrubSentryBreadcrumb,
  scrubSentryEvent,
  sentryRelease,
} from '@/lib/observability/sentry';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
const publicEnvironment =
  process.env.NEXT_PUBLIC_APP_ENV ??
  (siteUrl.includes('staging.')
    ? 'staging'
    : /^https:\/\/(www\.)?cherieday\.eu/.test(siteUrl)
      ? 'production'
      : 'development');
const enabled = ['staging', 'production'].includes(publicEnvironment) && Boolean(dsn);

type SentryModule = typeof import('@sentry/nextjs');
let client: Promise<SentryModule> | null = null;

function loadSentry() {
  if (!enabled) return null;
  if (!client) {
    client = import('@sentry/nextjs').then((Sentry) => {
      Sentry.init({
        dsn,
        enabled: true,
        environment: publicEnvironment,
        release: sentryRelease,
        sendDefaultPii: false,
        tracesSampleRate: 0.05,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        beforeBreadcrumb: scrubSentryBreadcrumb,
        beforeSend: scrubSentryEvent,
      });
      return Sentry;
    });
  }
  return client;
}

void loadSentry();

export function onRouterTransitionStart(
  ...args: Parameters<SentryModule['captureRouterTransitionStart']>
) {
  void loadSentry()?.then((Sentry) => Sentry.captureRouterTransitionStart(...args));
}
