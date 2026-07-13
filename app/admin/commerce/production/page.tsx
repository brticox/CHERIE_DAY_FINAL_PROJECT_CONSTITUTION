import Link from 'next/link';
import { OperationList, OperationalStatus } from '@/components/admin/operation-list';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
type Job = Database['public']['Tables']['production_jobs']['Row'] & {
  orders: { order_number: string } | null;
  order_items: {
    product_snapshot: Database['public']['Tables']['order_items']['Row']['product_snapshot'];
  } | null;
};
export const dynamic = 'force-dynamic';
export default async function Page() {
  let rows: Job[] = [];
  let unavailable = true;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data, error } = await createAdminClient()
      .from('production_jobs')
      .select('*,orders(order_number),order_items(product_snapshot)')
      .order('priority', { ascending: false })
      .order('created_at')
      .limit(100);
    rows = (data ?? []) as Job[];
    unavailable = Boolean(error);
  }
  return (
    <OperationList
      eyebrow="Atölye operasyonu"
      title="Üretim & Kalite"
      description="Onaylanan tasarımların üretim kuyruğu, öncelik ve teslim hedefleri."
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
        { label: 'Ürün', render: (r) => productName(r.order_items?.product_snapshot) },
        { label: 'Durum', render: (r) => <OperationalStatus value={r.status} /> },
        { label: 'Öncelik', render: (r) => r.priority },
        { label: 'Termin', render: (r) => (r.due_at ? date(r.due_at) : 'Belirlenmedi') },
        { label: 'Başlangıç', render: (r) => (r.started_at ? date(r.started_at) : '—') },
      ]}
    />
  );
}
function productName(v: unknown) {
  return v &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    'name' in v &&
    typeof v.name === 'string'
    ? v.name
    : 'CHERIE DAY ürünü';
}
function date(v: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(v));
}
