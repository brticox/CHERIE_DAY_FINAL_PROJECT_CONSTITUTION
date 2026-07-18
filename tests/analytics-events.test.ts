import { describe, expect, it } from 'vitest';

import { analyticsEventSchema } from '@/lib/analytics/events';

const base = {
  id: '90000000-0000-4000-8000-000000000001',
  eventName: 'begin_checkout',
  route: '/odeme',
  occurredAt: '2026-07-18T10:00:00.000Z',
};

describe('first-party analytics event contract', () => {
  it('accepts bounded, pseudonymous commerce context', () => {
    expect(
      analyticsEventSchema.safeParse({
        ...base,
        properties: { item_count: 2, value_minor: 23530, currency: 'TRY' },
      }).success,
    ).toBe(true);
  });

  it.each(['email', 'customer_name', 'phone_number', 'address_text', 'search_query'])(
    'rejects likely PII/free-text property: %s',
    (key) => {
      expect(
        analyticsEventSchema.safeParse({ ...base, properties: { [key]: 'secret' } })
          .success,
      ).toBe(false);
    },
  );

  it('rejects routes containing query strings', () => {
    expect(analyticsEventSchema.safeParse({ ...base, route: '/odeme?email=x' }).success).toBe(
      false,
    );
  });

  it.each([
    ['view_item', 'product'],
    ['add_to_cart', 'product'],
    ['begin_checkout', 'order'],
    ['purchase', 'order'],
    ['service_lead_submitted', 'service'],
    ['proof_viewed', 'proof'],
    ['proof_approved', 'proof'],
  ] as const)('defines the launch funnel event %s', (eventName, entityType) => {
    expect(
      analyticsEventSchema.safeParse({ ...base, eventName, entityType, entityId: 'opaque-id' })
        .success,
    ).toBe(true);
  });
});
