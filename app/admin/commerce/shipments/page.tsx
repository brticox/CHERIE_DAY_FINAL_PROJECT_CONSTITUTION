import Link from 'next/link';
import { OperationList, OperationalStatus } from '@/components/admin/operation-list';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
import { transitionShipment } from './actions';
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
        { label: 'Sonraki adım', render: (r) => <ShipmentAction row={r} /> },
      ]}
    />
  );
}
const nextState:Record<string,string|undefined>={preparing:'shipped',shipped:'in_transit',in_transit:'delivered'};
function ShipmentAction({row}:{row:Shipment}){const next=nextState[row.status];if(!next)return <span className="text-xs text-cherie-soft-ink">İşlem yok</span>;return <form action={transitionShipment}><input type="hidden" name="id" value={row.id}/><input type="hidden" name="status" value={next}/><button className="min-h-10 rounded-control border border-cherie-burgundy px-3 text-xs font-bold text-cherie-burgundy">{next}</button></form>}
function date(v: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(v));
}
