import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

import { requireFinanceRead } from '@/lib/payments/finance-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  approveRefundAction,
  requestRefundAction,
  simulateRefundAction,
} from '../actions';

type Refund = {
  id: string;
  payment_id: string;
  amount: number;
  amount_minor: number;
  status: string;
  provider_status: string;
  reason: string;
  retryable: boolean;
  provider_reference: string | null;
};
type Payment = {
  id: string;
  amount: number;
  status: string;
  provider_conversation_id: string | null;
  order_id: string | null;
};
export default async function Page() {
  await requireFinanceRead('/admin/finance/refunds');
  const db = createAdminClient() as unknown as SupabaseClient;
  const [{ data: refundData }, { data: paymentData }] = await Promise.all([
    db.from('refunds').select('*').order('created_at', { ascending: false }).limit(200),
    db
      .from('payments')
      .select('id,amount,status,provider_conversation_id,order_id')
      .in('status', ['paid', 'partially_refunded'])
      .order('created_at', { ascending: false })
      .limit(100),
  ]);
  const refunds = (refundData ?? []) as Refund[];
  const payments = (paymentData ?? []) as Payment[];
  return (
    <div className="space-y-8 p-5 md:p-8">
      <h1 className="font-display text-4xl">İade operasyonu</h1>
      <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5">
        <h2 className="font-display text-2xl">Yeni iade talebi</h2>
        <form action={requestRefundAction} className="mt-4 grid gap-3">
          <input type="hidden" name="request_id" value={randomUUID()} />
          <select name="payment_id" required className="cherie-field">
            <option value="">Ödeme seçin</option>
            {payments.map((p) => (
              <option key={p.id} value={p.id}>
                {p.provider_conversation_id} · {p.amount} TRY
              </option>
            ))}
          </select>
          <input
            name="amount"
            inputMode="decimal"
            required
            className="cherie-field"
            placeholder="İade tutarı, örn. 125.50"
          />
          <select name="reason" className="cherie-field">
            <option value="customer_request">Müşteri talebi</option>
            <option value="defect">Kusur</option>
            <option value="cancellation">İptal</option>
            <option value="duplicate">Mükerrer</option>
            <option value="goodwill">Müşteri memnuniyeti</option>
            <option value="other">Diğer</option>
          </select>
          <input
            name="confirmation"
            required
            className="cherie-field"
            placeholder="Yüksek risk onayı: sipariş numarası"
          />
          <textarea
            name="note"
            maxLength={1000}
            className="cherie-field"
            placeholder="Finans notu"
          />
          <button className="cherie-button-primary">Talep oluştur</button>
        </form>
      </section>
      {refunds.map((r) => (
        <section
          key={r.id}
          className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5"
        >
          <h2 className="font-semibold">
            {r.amount} TRY · {r.reason}
          </h2>
          <p className="mt-2 text-sm">
            {r.status} · {r.provider_status}
            {r.retryable ? ' · tekrar denenebilir' : ''}
          </p>
          {r.status === 'requested' && (
            <form action={approveRefundAction} className="mt-4 flex gap-3">
              <input type="hidden" name="refund_id" value={r.id} />
              <input
                name="confirmation"
                required
                className="cherie-field flex-1"
                placeholder="REFUND CD-..."
              />
              <button className="cherie-button-primary">Onayla</button>
            </form>
          )}
          {(r.status === 'approved' || (r.status === 'processing' && r.retryable)) &&
            process.env.NODE_ENV !== 'production' && (
              <form action={simulateRefundAction} className="mt-4 flex gap-3">
                <input type="hidden" name="refund_id" value={r.id} />
                <select name="outcome" className="cherie-field">
                  <option value="success">Simüle başarılı</option>
                  <option value="failure">Simüle ret</option>
                  <option value="timeout">Simüle zaman aşımı</option>
                </select>
                <button className="cherie-button-primary">
                  Yerel sağlayıcıyı çalıştır
                </button>
              </form>
            )}
        </section>
      ))}
    </div>
  );
}
