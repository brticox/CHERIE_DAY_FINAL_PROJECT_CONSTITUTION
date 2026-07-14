import type { SupabaseClient } from '@supabase/supabase-js';

import { formatTRY } from '@/lib/format';
import { requireFinanceRead } from '@/lib/payments/finance-auth';
import { createAdminClient } from '@/lib/supabase/admin';

type Row = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  provider: string;
  provider_conversation_id: string | null;
  amount_minor: number;
  attempt_number: number;
  initialized_at: string | null;
  paid_at: string | null;
  order_id: string | null;
};

export default async function Page() {
  await requireFinanceRead('/admin/finance/payments');
  const db = createAdminClient() as unknown as SupabaseClient;
  const { data } = await db
    .from('payments')
    .select(
      'id,status,amount,currency,provider,provider_conversation_id,amount_minor,attempt_number,initialized_at,paid_at,order_id',
    )
    .order('created_at', { ascending: false })
    .limit(200);
  const rows = (data ?? []) as Row[];
  return <FinanceTable title="Ödemeler" rows={rows} />;
}

function FinanceTable({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="space-y-6 p-5 md:p-8">
      <h1 className="font-display text-4xl">{title}</h1>
      <div className="overflow-x-auto rounded-card-lg border border-cherie-lace">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-cherie-paper">
            <tr>
              {[
                'Sağlayıcı',
                'Durum',
                'Tutar',
                'Deneme',
                'Sipariş ref.',
                'Kanıt zamanı',
              ].map((x) => (
                <th key={x} className="p-3">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-cherie-lace">
                <td className="p-3">{row.provider}</td>
                <td className="p-3 font-semibold">{row.status}</td>
                <td className="p-3">{formatTRY(Number(row.amount))}</td>
                <td className="p-3">{row.attempt_number}</td>
                <td className="p-3 font-mono text-xs">
                  {row.provider_conversation_id ?? '—'}
                </td>
                <td className="p-3">
                  {row.paid_at ?? row.initialized_at ?? 'Bekleniyor'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
