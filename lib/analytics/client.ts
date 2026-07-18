'use client';

import { analyticsEventSchema, type AnalyticsEventName } from './events';
import { hasConsent } from '@/lib/consent/preferences';

export function trackEvent(
  eventName: AnalyticsEventName,
  context: {
    route?: string;
    entityType?: 'product' | 'collection' | 'service' | 'order' | 'proof';
    entityId?: string;
    properties?: Record<string, string | number | boolean | null>;
  } = {},
) {
  if (typeof window === 'undefined' || !hasConsent('analytics')) return false;
  const event = analyticsEventSchema.safeParse({
    id: crypto.randomUUID(),
    eventName,
    route: context.route ?? window.location.pathname,
    entityType: context.entityType,
    entityId: context.entityId,
    properties: context.properties ?? {},
    occurredAt: new Date().toISOString(),
  });
  if (!event.success) return false;

  const body = JSON.stringify(event.data);
  if (navigator.sendBeacon) {
    return navigator.sendBeacon(
      '/api/analytics/events',
      new Blob([body], { type: 'application/json' }),
    );
  }
  void fetch('/api/analytics/events', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  });
  return true;
}
