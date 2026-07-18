import { z } from 'zod';

export const ANALYTICS_EVENTS = [
  'page_view',
  'view_item',
  'add_to_cart',
  'remove_from_cart',
  'view_cart',
  'begin_checkout',
  'select_shipping',
  'login',
  'sign_up',
  'purchase',
  'service_lead_submitted',
  'proof_viewed',
  'proof_approved',
] as const;

const FORBIDDEN_PROPERTY = /(email|e-mail|name|phone|address|message|note|query|text)/i;
const propertyValue = z.union([
  z.string().max(160),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const analyticsEventSchema = z
  .object({
    id: z.string().uuid(),
    eventName: z.enum(ANALYTICS_EVENTS),
    route: z.string().startsWith('/').max(300).refine((value) => !value.includes('?')),
    entityType: z.enum(['product', 'collection', 'service', 'order', 'proof']).optional(),
    entityId: z.string().min(1).max(160).optional(),
    properties: z.record(z.string(), propertyValue).default({}),
    occurredAt: z.string().datetime(),
  })
  .superRefine((event, ctx) => {
    const entries = Object.entries(event.properties);
    if (entries.length > 20) {
      ctx.addIssue({ code: 'custom', path: ['properties'], message: 'too_many_properties' });
    }
    for (const [key] of entries) {
      if (key.length > 60 || FORBIDDEN_PROPERTY.test(key)) {
        ctx.addIssue({ code: 'custom', path: ['properties', key], message: 'forbidden_property' });
      }
    }
  });

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
