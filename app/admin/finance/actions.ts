'use server';

import { createHash } from 'node:crypto';
import { redirect } from 'next/navigation';

import { tryToMinor } from '@/lib/payments/money';
import { requireFinanceMutation } from '@/lib/payments/finance-auth';
import { processApprovedRefund } from '@/lib/payments/refund-orchestrator';
import { SimulatedRefundProvider } from '@/lib/payments/refunds';
import { assertPaytrSimulatorEnvironment } from '@/lib/payments/paytr-simulator';
import type { Database } from '@/lib/supabase/database.types';

export async function requestRefundAction(formData: FormData) {
  const session = await requireFinanceMutation('/admin/finance/refunds');
  const rpc = session.supabase.rpc as unknown as FinanceRpc;
  const paymentId = String(formData.get('payment_id') ?? '');
  const amount = String(formData.get('amount') ?? '');
  const confirmation = String(formData.get('confirmation') ?? '');
  const reason = String(
    formData.get('reason') ?? 'customer_request',
  ) as Database['public']['Enums']['refund_reason'];
  const requestId = String(formData.get('request_id') ?? '');
  const note = String(formData.get('note') ?? '');
  if (!/^[0-9a-f-]{36}$/.test(paymentId) || !/^[0-9a-f-]{36}$/.test(requestId)) {
    redirect('/admin/finance/refunds?result=invalid');
  }
  try {
    const idempotencyKey = createHash('sha256')
      .update(`refund:${requestId}:${paymentId}:${amount}`)
      .digest('hex');
    const { error } = await rpc('request_finance_refund', {
      p_payment_id: paymentId,
      p_amount_minor: tryToMinor(amount),
      p_reason: reason,
      p_confirmation: confirmation,
      p_idempotency_key: idempotencyKey,
      p_note: note,
    });
    if (error) throw error;
  } catch {
    redirect('/admin/finance/refunds?result=denied');
  }
  redirect('/admin/finance/refunds?result=requested');
}

export async function approveRefundAction(formData: FormData) {
  const session = await requireFinanceMutation('/admin/finance/refunds');
  const rpc = session.supabase.rpc as unknown as FinanceRpc;
  const refundId = String(formData.get('refund_id') ?? '');
  const confirmation = String(formData.get('confirmation') ?? '');
  const { error } = await rpc('approve_finance_refund', {
    p_refund_id: refundId,
    p_confirmation: confirmation,
  });
  redirect(`/admin/finance/refunds?result=${error ? 'denied' : 'approved'}`);
}

export async function simulateRefundAction(formData: FormData) {
  await requireFinanceMutation('/admin/finance/refunds');
  let succeeded = false;
  try {
    assertPaytrSimulatorEnvironment();
    const refundId = String(formData.get('refund_id') ?? '');
    const outcome = String(formData.get('outcome') ?? 'success');
    if (!['success', 'failure', 'timeout'].includes(outcome))
      throw new Error('INVALID_OUTCOME');
    await processApprovedRefund(
      refundId,
      new SimulatedRefundProvider(outcome as 'success' | 'failure' | 'timeout'),
    );
    succeeded = true;
  } catch {
    succeeded = false;
  }
  redirect(
    `/admin/finance/refunds?result=${succeeded ? 'processed' : 'processing_failed'}`,
  );
}

export async function resolveDiscrepancyAction(formData: FormData) {
  const session = await requireFinanceMutation('/admin/finance/reconciliation');
  const rpc = session.supabase.rpc as unknown as FinanceRpc;
  const discrepancyId = String(formData.get('discrepancy_id') ?? '');
  const status = String(formData.get('status') ?? 'investigating');
  const notes = String(formData.get('notes') ?? '');
  const { error } = await rpc('resolve_payment_discrepancy', {
    p_discrepancy_id: discrepancyId,
    p_status: status,
    p_notes: notes,
  });
  redirect(`/admin/finance/reconciliation?result=${error ? 'denied' : 'saved'}`);
}

type FinanceRpc = (
  name: string,
  args: Record<string, unknown>,
) => Promise<{ error: { message: string } | null }>;
