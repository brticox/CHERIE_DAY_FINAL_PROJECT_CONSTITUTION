import 'server-only';

import { randomUUID } from 'node:crypto';

import { createAdminClient } from '@/lib/supabase/admin';
import type { Database, Json } from '@/lib/supabase/database.types';
import { classifyNotificationError } from './errors';
import { enqueueNotification } from './enqueue';
import { getEmailTransport } from './providers';
import { resolveRecipient } from './recipients';
import { nextRetryAt, shouldRetry } from './retry';
import { renderTemplate } from './templates';
import type { NotificationPayload } from './types';

type OutboxRow = Database['public']['Tables']['notification_outbox']['Row'];

export async function processNotificationBatch(batchSize = 20) {
  const admin = createAdminClient();
  const workerId = `notification-worker:${randomUUID()}`;
  const { data, error } = await admin.rpc('claim_notification_outbox', {
    p_worker_id: workerId,
    p_batch_size: Math.min(Math.max(batchSize, 1), 100),
    p_stale_after_seconds: 900,
  });
  if (error) throw new Error(`Outbox claim failed: ${error.code}`);

  const summary = { claimed: data.length, sent: 0, retried: 0, permanentlyFailed: 0 };
  for (const row of data as OutboxRow[]) {
    try {
      const recipient = resolveRecipient(row.recipient_kind, row.recipient_email);
      const rendered = renderTemplate(row.template_key, payloadObject(row.payload));
      const transport = getEmailTransport();
      const result = await transport.send({
        ...rendered,
        to: recipient,
        idempotencyKey: row.idempotency_key,
      });
      const { error: updateError } = await admin
        .from('notification_outbox')
        .update({
          status: 'sent',
          provider: result.provider,
          provider_message_id: result.messageId,
          sent_at: new Date().toISOString(),
          locked_at: null,
          locked_by: null,
          last_error: null,
          last_error_code: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
        .eq('locked_by', workerId)
        .eq('status', 'processing');
      if (updateError) throw new Error(`Outbox completion failed: ${updateError.code}`);
      summary.sent += 1;
    } catch (caught) {
      const failure = classifyNotificationError(caught);
      const retry = shouldRetry(failure.retryable, row.attempts, row.max_attempts);
      await admin
        .from('notification_outbox')
        .update({
          status: retry ? 'retry_scheduled' : 'permanently_failed',
          next_attempt_at: retry ? nextRetryAt(row.attempts).toISOString() : row.next_attempt_at,
          failed_at: retry ? null : new Date().toISOString(),
          last_error: failure.message,
          last_error_code: failure.code,
          locked_at: null,
          locked_by: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
        .eq('locked_by', workerId);
      if (retry) summary.retried += 1;
      else {
        summary.permanentlyFailed += 1;
        if (row.template_key !== 'staff_notification_permanently_failed') {
          await enqueueNotification({
            eventType: 'notification_permanently_failed',
            aggregateType: 'notification',
            aggregateId: row.id,
            recipientKind: 'staff',
            templateKey: 'staff_notification_permanently_failed',
            payload: { notification_id: row.id, template_key: row.template_key },
            idempotencyKey: `notification_failed:${row.id}:staff`,
            category: 'operational',
          }).catch(() => undefined);
        }
      }
    }
  }
  return summary;
}

function payloadObject(payload: Json): NotificationPayload {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return {};
  return payload as NotificationPayload;
}
