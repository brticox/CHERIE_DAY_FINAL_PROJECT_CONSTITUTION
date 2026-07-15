import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

const eventSchema = z.object({
  type: z.enum([
    'email.sent',
    'email.delivered',
    'email.delivery_delayed',
    'email.bounced',
    'email.complained',
    'email.failed',
    'email.suppressed',
  ]),
  created_at: z.string().datetime(),
  data: z.object({ email_id: z.string().min(1).max(200) }).passthrough(),
});

export type ResendDeliveryEvent = z.infer<typeof eventSchema>;

export function verifyResendWebhook(
  payload: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
  now = Date.now(),
): ResendDeliveryEvent {
  if (
    !headers.id ||
    !headers.timestamp ||
    !headers.signature ||
    !secret.startsWith('whsec_')
  ) {
    throw new Error('Webhook doğrulaması başarısız.');
  }
  const timestamp = Number(headers.timestamp);
  if (!Number.isFinite(timestamp) || Math.abs(now / 1000 - timestamp) > 300) {
    throw new Error('Webhook zaman damgası geçersiz.');
  }
  const key = Buffer.from(secret.slice(6), 'base64');
  const expected = createHmac('sha256', key)
    .update(`${headers.id}.${headers.timestamp}.${payload}`)
    .digest('base64');
  const valid = headers.signature.split(' ').some((entry) => {
    const [version, candidate] = entry.split(',');
    if (version !== 'v1' || !candidate) return false;
    const left = Buffer.from(candidate);
    const right = Buffer.from(expected);
    return left.length === right.length && timingSafeEqual(left, right);
  });
  if (!valid) throw new Error('Webhook imzası geçersiz.');
  return eventSchema.parse(JSON.parse(payload));
}
