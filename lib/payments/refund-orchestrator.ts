import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { RefundProvider } from './refunds';

type RefundRecord = {
  id: string;
  payment_id: string;
  amount_minor: number;
  idempotency_key: string;
  status: string;
};

export async function processApprovedRefund(refundId: string, provider: RefundProvider) {
  const admin = createAdminClient();
  const { data: rawRefund, error: refundError } = await admin
    .from('refunds')
    .select('*')
    .eq('id', refundId)
    .maybeSingle();
  const refund = rawRefund as unknown as RefundRecord | null;
  if (refundError || !refund?.payment_id || !refund.idempotency_key) {
    throw new Error('REFUND_NOT_FOUND');
  }
  const { data: payment } = await admin
    .from('payments')
    .select('provider,provider_conversation_id')
    .eq('id', refund.payment_id)
    .maybeSingle();
  if (!payment?.provider_conversation_id || payment.provider !== 'paytr') {
    throw new Error('REFUND_PROVIDER_UNAVAILABLE');
  }

  const { error: markError } = await admin.rpc('mark_refund_submitted', {
    p_refund_id: refund.id,
  });
  if (markError) throw new Error('REFUND_SUBMISSION_LOCK_FAILED');

  const result = await provider.submit({
    merchantOrderId: payment.provider_conversation_id,
    amountMinor: Number(refund.amount_minor),
    idempotencyKey: refund.idempotency_key,
  });
  const { error: resultError } = await admin.rpc('record_refund_submission', {
    p_refund_id: refund.id,
    p_succeeded: result.succeeded,
    p_provider_reference: result.providerReference,
    p_error_code: result.errorCode,
    p_retryable: result.retryable,
  });
  if (resultError) throw new Error('REFUND_RESULT_RECORD_FAILED');
  return result;
}
