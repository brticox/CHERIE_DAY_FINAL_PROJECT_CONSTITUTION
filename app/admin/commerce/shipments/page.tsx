import Link from 'next/link';
import { OperationList, OperationalStatus } from '@/components/admin/operation-list';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
import { createShipment, recordShipmentException, transitionShipment } from './actions';
import { AdminPagination } from '@/components/admin/pagination';
type Shipment = Database['public']['Tables']['shipments']['Row'] & {
  orders: { order_number: string } | null;
};
export const dynamic = 'force-dynamic';
const PAGE_SIZE = 50;
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireCapability('orders.read', '/admin/commerce/shipments');
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1);
  let rows: Shipment[] = [];
  let total = 0;
  let orders: { id: string; order_number: string }[] = [];
  let unavailable = true;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const db = createAdminClient();
    const [{ data, count, error }, orderRows] = await Promise.all([
      db
        .from('shipments')
        .select('*,orders(order_number)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
      db
        .from('orders')
        .select('id,order_number')
        .in('status', ['quality_check', 'packed'])
        .order('created_at', { ascending: false }),
    ]);
    rows = (data ?? []) as Shipment[];
    total = count ?? 0;
    unavailable = Boolean(error);
    orders = orderRows.data ?? [];
  }
  return (
    <div className="space-y-6">
      <form
        action={createShipment}
        className="mx-4 mt-4 grid gap-3 rounded-card-lg border border-cherie-lace bg-white/60 p-5 md:mx-8 md:mt-8 md:grid-cols-5"
      >
        <select aria-label="Gönderi siparişi" name="order_id" required className="cherie-field">
          <option value="">Sipariş seçin</option>
          {orders.map((x) => (
            <option key={x.id} value={x.id}>
              {x.order_number}
            </option>
          ))}
        </select>
        <input
          aria-label="Kargo firması"
          name="carrier"
          required
          placeholder="Kargo firması"
          className="cherie-field"
        />
        <input
          aria-label="Takip numarası"
          name="tracking"
          required
          placeholder="Takip numarası"
          className="cherie-field"
        />
        <input
          aria-label="Paket sayısı"
          name="package_count"
          type="number"
          min="1"
          defaultValue="1"
          className="cherie-field"
        />
        <button className="cherie-button-primary">Gönderi oluştur</button>
        <textarea
          aria-label="Gönderi iç notu"
          name="internal_note"
          placeholder="İç not"
          className="cherie-field md:col-span-5"
        />
      </form>
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
          {
            label: 'Paket / istisna',
            render: (r) => (
              <>
                {r.package_count} paket
                {r.exception_code && (
                  <p className="text-xs text-cherie-error">{r.exception_code}</p>
                )}
              </>
            ),
          },
          { label: 'Çıkış', render: (r) => (r.shipped_at ? date(r.shipped_at) : '—') },
          {
            label: 'Teslim',
            render: (r) => (r.delivered_at ? date(r.delivered_at) : '—'),
          },
          {
            label: 'Sonraki adım',
            render: (r) => (
              <div className="space-y-2">
                <ShipmentAction row={r} />
                {r.status !== 'delivered' && (
                  <details>
                    <summary className="cursor-pointer text-xs font-bold text-cherie-error">
                      İstisna kaydet
                    </summary>
                    <form
                      action={recordShipmentException}
                      className="mt-2 grid min-w-64 gap-2"
                    >
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        aria-label="Teslimat istisna kodu"
                        name="exception_code"
                        placeholder="Kod"
                        className="cherie-field"
                      />
                      <textarea
                        aria-label="Teslimat istisna açıklaması"
                        name="note"
                        placeholder="Açıklama"
                        className="cherie-field"
                      />
                      <button className="cherie-button-secondary">Kaydet</button>
                    </form>
                  </details>
                )}
              </div>
            ),
          },
        ]}
      />
      <div className="px-4 pb-6 md:px-8">
        <AdminPagination
          path="/admin/commerce/shipments"
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          label="Gönderi sayfalama"
        />
      </div>
    </div>
  );
}
const nextState: Record<string, string | undefined> = {
  preparing: 'shipped',
  shipped: 'in_transit',
  in_transit: 'delivered',
};
function ShipmentAction({ row }: { row: Shipment }) {
  const next = nextState[row.status];
  if (!next) return <span className="text-xs text-cherie-soft-ink">İşlem yok</span>;
  return (
    <form action={transitionShipment}>
      <input type="hidden" name="id" value={row.id} />
      <input type="hidden" name="status" value={next} />
      <button className="min-h-10 rounded-control border border-cherie-burgundy px-3 text-xs font-bold text-cherie-burgundy">
        {next}
      </button>
    </form>
  );
}
function date(v: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(v));
}
