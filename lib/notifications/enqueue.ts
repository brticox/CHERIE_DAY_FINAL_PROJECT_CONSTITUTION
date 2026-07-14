import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/database.types';

export async function enqueueNotification(input: {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  recipientKind: 'customer' | 'staff';
  recipientEmail?: string;
  customerId?: string;
  orderId?: string;
  templateKey: string;
  payload: Json;
  idempotencyKey: string;
  category?: 'transactional' | 'operational' | 'security';
}) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('enqueue_notification', {
    p_event_type: input.eventType,
    p_aggregate_type: input.aggregateType,
    p_aggregate_id: input.aggregateId,
    p_recipient_kind: input.recipientKind,
    p_recipient_email: input.recipientEmail ?? null,
    p_customer_id: input.customerId ?? null,
    p_order_id: input.orderId ?? null,
    p_template_key: input.templateKey,
    p_payload: input.payload,
    p_idempotency_key: input.idempotencyKey,
    p_category: input.category ?? 'transactional',
    p_locale: 'tr-TR',
  });
  if (error) throw new Error(`Notification enqueue failed: ${error.code}`);
  return data;
}
