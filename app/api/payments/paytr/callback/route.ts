import { createHash } from 'node:crypto';

import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPaytrCallback } from '@/lib/payments/paytr';

export const dynamic = 'force-dynamic';

function response(message: string, status = 200) {
  return new Response(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 65_536) return response('PAYLOAD_TOO_LARGE', 413);
  if (
    !process.env.PAYTR_MERCHANT_ID ||
    !process.env.PAYTR_MERCHANT_KEY ||
    !process.env.PAYTR_MERCHANT_SALT ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return response('PAYMENT_PROVIDER_UNAVAILABLE', 503);
  }
  const form = await request.formData();
  const merchantOrderId = String(form.get('merchant_oid') ?? '');
  const status = String(form.get('status') ?? '');
  const totalAmount = String(form.get('total_amount') ?? '');
  const hash = String(form.get('hash') ?? '');
  if (!merchantOrderId || !status || !totalAmount || !hash) {
    return response('BAD_REQUEST', 400);
  }
  if (!verifyPaytrCallback({ merchantOrderId, status, totalAmount, hash })) {
    return response('BAD_SIGNATURE', 400);
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from('payments')
    .select('id,amount')
    .eq('provider', 'paytr')
    .eq('provider_conversation_id', merchantOrderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!payment) return response('PAYMENT_NOT_FOUND', 404);

  const paymentAmount = form.get('payment_amount');
  if (
    status === 'success' &&
    (!paymentAmount || Number(paymentAmount) !== Math.round(Number(payment.amount) * 100))
  ) {
    return response('AMOUNT_MISMATCH', 400);
  }
  const providerEventId = createHash('sha256')
    .update(`${merchantOrderId}:${status}:${totalAmount}:${hash}`)
    .digest('hex');
  const payload = Object.fromEntries(
    [...form.entries()].map(([key, value]) => [
      key,
      key === 'hash' ? '[redacted]' : String(value),
    ]),
  );
  const normalizedStatus = status === 'success' ? 'paid' : 'failed';
  const { error } = await admin.rpc('apply_payment_event', {
    p_payment_id: payment.id,
    p_provider_event_id: providerEventId,
    p_event_type: `paytr.${status}`,
    p_status: normalizedStatus,
    p_provider_payment_id: merchantOrderId,
    p_provider_conversation_id: merchantOrderId,
    p_amount: Number(payment.amount),
    p_signature_valid: true,
    p_payload: payload,
    p_error_code: form.get('failed_reason_code')
      ? String(form.get('failed_reason_code'))
      : undefined,
    p_error_message: form.get('failed_reason_msg')
      ? String(form.get('failed_reason_msg'))
      : undefined,
  });
  if (error) return response('PROCESSING_FAILED', 500);
  // PayTR requires this exact acknowledgement and retries until it receives it.
  return response('OK');
}
