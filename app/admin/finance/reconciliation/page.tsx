import type { SupabaseClient } from '@supabase/supabase-js';

import { requireFinanceRead } from '@/lib/payments/finance-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveDiscrepancyAction } from '../actions';

type Row = {
  id: string;
  discrepancy_type: string;
  severity: string;
  status: string;
  provider_reference: string | null;
  expected_amount_minor: number | null;
  provider_amount_minor: number | null;
  recommended_action: string;
  last_checked_at: string;
};
export default async function Page() {
  await requireFinanceRead('/admin/finance/reconciliation');
  const db = createAdminClient() as unknown as SupabaseClient;
  const { data } = await db
    .from('payment_reconciliation_discrepancies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  const rows = (data ?? []) as Row[];
  return (
    <div className="space-y-6 p-5 md:p-8">
      <h1 className="font-display text-4xl">Uzlaştırma farkları</h1>
      {rows.map((row) => (
        <section
          key={row.id}
          className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5"
        >
          <div className="flex flex-wrap justify-between gap-3">
            <h2 className="font-semibold">
              {row.discrepancy_type} · {row.severity}
            </h2>
            <span>{row.status}</span>
          </div>
          <p className="mt-3 text-sm text-cherie-soft-ink">{row.recommended_action}</p>
          <p className="mt-2 font-mono text-xs">
            {row.provider_reference ?? '—'} · {row.expected_amount_minor ?? '—'} /{' '}
            {row.provider_amount_minor ?? '—'} kuruş
          </p>
          <form
            action={resolveDiscrepancyAction}
            className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]"
          >
            <input type="hidden" name="discrepancy_id" value={row.id} />
            <select name="status" className="cherie-field">
              <option value="investigating">İnceleniyor</option>
              <option value="resolved">Çözüldü</option>
              <option value="dismissed">Kanıtla kapatıldı</option>
            </select>
            <input
              name="notes"
              required
              minLength={5}
              maxLength={2000}
              className="cherie-field"
              placeholder="Kanıt ve karar notu"
            />
            <button className="cherie-button-primary">Kaydet</button>
          </form>
        </section>
      ))}
    </div>
  );
}
