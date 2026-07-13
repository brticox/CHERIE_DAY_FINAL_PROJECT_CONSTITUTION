import Link from 'next/link';
import { OperationList, OperationalStatus } from '@/components/admin/operation-list';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
type Shipment = Database['public']['Tables']['shipments']['Row'] & {
  orders: { order_number: string } | null;
};
export const dynamic = 'force-dynamic';
export default async function Page() {
  let rows: Shipment[] = [];
  let unavailable = true;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data, error } = await createAdminClient()
      .from('shipments')
      .select('*,orders(order_number)')
      .order('created_at', { ascending: false })
      .limit(100);
    rows = (data ?? []) as Shipment[];
    unavailable = Boolean(error);
  }
  return (
    <OperationList
      eyebrow="Teslimat operasyonu"
      title="Kargo & Teslimat"
      description="Kargo firması, takip numarası ve teslimat durumlarının merkezi görünümü."
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
          label: 'Kargo',
          render: (r) => (
            <>
              <p className="font-semibold">{r.carrier_name ?? 'Belirlenmedi'}</p>
              <p className="text-xs text-cherie-soft-ink">
                {r.tracking_number ?? 'Takip numarası yok'}
              </p>
            </>
          ),
        },
        { label: 'Durum', render: (r) => <OperationalStatus value={r.status} /> },
        { label: 'Çıkış', render: (r) => (r.shipped_at ? date(r.shipped_at) : '—') },
        { label: 'Teslim', render: (r) => (r.delivered_at ? date(r.delivered_at) : '—') },
      ]}
    />
  );
}
function date(v: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(v));
}
