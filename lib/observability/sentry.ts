import type { Breadcrumb, ErrorEvent } from '@sentry/nextjs';

import { scrubTelemetry } from '@/lib/observability/scrub';

function stripQuery(value: string | undefined) {
  if (!value) return value;
  try {
    const url = new URL(value, 'https://staging.cherieday.eu');
    url.search = '';
    url.hash = '';
    return url.origin === 'https://staging.cherieday.eu' && !value.startsWith('http')
      ? url.pathname
      : url.toString();
  } catch {
    return '[GİZLENDİ]';
  }
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  event.user = undefined;

  if (event.request) {
    event.request.url = stripQuery(event.request.url);
    event.request.query_string = undefined;
    event.request.cookies = undefined;
    event.request.headers = scrubTelemetry(event.request.headers) as Record<
      string,
      string
    >;
    event.request.data = scrubTelemetry(event.request.data);
  }

  event.extra = scrubTelemetry(event.extra) as ErrorEvent['extra'];
  event.contexts = scrubTelemetry(event.contexts) as ErrorEvent['contexts'];
  event.tags = scrubTelemetry(event.tags) as ErrorEvent['tags'];
  event.breadcrumbs = event.breadcrumbs?.slice(-30).map(scrubSentryBreadcrumb);

  return event;
}

export function scrubSentryBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  return {
    ...breadcrumb,
    data: scrubTelemetry(breadcrumb.data) as Breadcrumb['data'],
    message: breadcrumb.category?.startsWith('auth') ? '[GİZLENDİ]' : breadcrumb.message,
  };
}

export const sentryRelease = process.env.SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA;
export const sentryEnvironment = process.env.APP_ENV ?? 'development';
