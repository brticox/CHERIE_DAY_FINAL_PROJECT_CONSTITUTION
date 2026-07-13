import Link from 'next/link';
import { OperationList, OperationalStatus } from '@/components/admin/operation-list';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';

type Proof = Database['public']['Tables']['product_proofs']['Row'] & {
  orders: { order_number: string } | null;
};
export const dynamic = 'force-dynamic';
export default async function Page() {
  let rows: Proof[] = [];
  let unavailable = true;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data, error } = await createAdminClient()
      .from('product_proofs')
      .select('*,orders(order_number)')
      .order('created_at', { ascending: false })
      .limit(100);
    rows = (data ?? []) as Proof[];
    unavailable = Boolean(error);
  }
  return (
    <OperationList
      eyebrow="Tasarım operasyonu"
      title="Tasarım Onayları"
      description="Müşteriye gönderilen versiyonlar, onaylar ve revizyon talepleri."
      rows={rows}
      unavailable={unavailable}
      columns={[
        {
          label: 'Sipariş',
          render: (r) => (
            <Link
              className="font-semibold text-cherie-burgundy hover:underline"
              href={`/admin/commerce/orders/${r.order_id}`}
            >
              {r.orders?.order_number ?? '—'}
            </Link>
          ),
        },
        {
          label: 'Dosya / versiyon',
          render: (r) => (
            <>
              <p className="font-semibold">{r.file_name ?? 'Tasarım dosyası'}</p>
              <p className="text-xs text-cherie-soft-ink">v{r.version}</p>
            </>
          ),
        },
        { label: 'Durum', render: (r) => <OperationalStatus value={r.status} /> },
        {
          label: 'Müşteri notu',
          render: (r) => (
            <span className="line-clamp-2 max-w-xs text-cherie-soft-ink">
              {r.customer_comment ?? '—'}
            </span>
          ),
        },
        { label: 'Gönderim', render: (r) => date(r.sent_at ?? r.created_at) },
      ]}
    />
  );
}
function date(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}
