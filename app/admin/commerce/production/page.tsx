import Link from 'next/link';
import { OperationList, OperationalStatus } from '@/components/admin/operation-list';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
import {
  completeQualityCheck,
  transitionProduction,
  updateProductionJob,
} from './actions';
type Job = Database['public']['Tables']['production_jobs']['Row'] & {
  orders: { order_number: string } | null;
  order_items: {
    product_snapshot: Database['public']['Tables']['order_items']['Row']['product_snapshot'];
  } | null;
};
export const dynamic = 'force-dynamic';
export default async function Page() {
  let rows: Job[] = [];
  let staffRows: { id: string; name: string }[] = [];
  let unavailable = true;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const db = createAdminClient();
    const [{ data, error }, staff] = await Promise.all([
      db
        .from('production_jobs')
        .select('*,orders(order_number),order_items(product_snapshot)')
        .order('priority', { ascending: false })
        .order('created_at')
        .limit(100),
      db.from('staff_users').select('id,name').eq('is_active', true).order('name'),
    ]);
    rows = (data ?? []) as Job[];
    unavailable = Boolean(error);
    staffRows = staff.data ?? [];
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
        {
          label: 'Malzeme / engel',
          render: (r) => (
            <>
              {r.material_ready ? 'Hazır' : 'Bekliyor'}
              {r.blocker && (
                <p className="max-w-48 text-xs text-cherie-error">{r.blocker}</p>
              )}
            </>
          ),
        },
        {
          label: 'İşlemler',
          render: (r) => (
            <div className="space-y-2">
              <ProductionAction row={r} />
              <details>
                <summary className="cursor-pointer text-xs font-bold text-cherie-burgundy">
                  Planla / kalite
                </summary>
                <form action={updateProductionJob} className="mt-2 grid min-w-72 gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <select
                    name="assigned_staff_id"
                    defaultValue={r.assigned_staff_id ?? ''}
                    className="cherie-field"
                  >
                    <option value="">Atanmadı</option>
                    {staffRows.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="datetime-local"
                    name="due_at"
                    defaultValue={r.due_at?.slice(0, 16)}
                    className="cherie-field"
                  />
                  <input
                    type="number"
                    name="priority"
                    defaultValue={r.priority}
                    min="0"
                    max="100"
                    className="cherie-field"
                  />
                  <label className="text-xs">
                    <input
                      type="checkbox"
                      name="material_ready"
                      defaultChecked={r.material_ready}
                      className="mr-2"
                    />
                    Malzeme hazır
                  </label>
                  <input
                    name="blocker"
                    defaultValue={r.blocker ?? ''}
                    placeholder="Engel"
                    className="cherie-field"
                  />
                  <textarea
                    name="internal_note"
                    defaultValue={r.internal_note ?? ''}
                    placeholder="İç not"
                    className="cherie-field"
                  />
                  <button className="cherie-button-secondary">Planı kaydet</button>
                </form>
                {r.status === 'quality_check' && (
                  <form action={completeQualityCheck} className="mt-3 grid gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    {[
                      ['print', 'Baskı ve renk'],
                      ['personalization', 'Kişiselleştirme'],
                      ['packaging', 'Paketleme'],
                    ].map(([key, label]) => (
                      <label key={key} className="text-xs font-bold">
                        {label}
                        <select name={key} className="cherie-field">
                          <option value="pass">Geçti</option>
                          <option value="fail">Kaldı / rework</option>
                        </select>
                      </label>
                    ))}
                    <textarea
                      name="note"
                      placeholder="Kalite notu"
                      className="cherie-field"
                    />
                    <button className="cherie-button-primary">
                      Kalite kontrolünü tamamla
                    </button>
                  </form>
                )}
              </details>
            </div>
          ),
        },
      ]}
    />
  );
}
const nextState: Record<string, string | undefined> = {
  blocked: 'ready',
  ready: 'in_production',
  in_production: 'quality_check',
  quality_check: 'passed',
  rework: 'in_production',
  passed: 'packed',
  packed: 'completed',
};
function ProductionAction({ row }: { row: Job }) {
  const next = nextState[row.status];
  if (!next) return <span className="text-xs text-cherie-soft-ink">İşlem yok</span>;
  return (
    <form action={transitionProduction}>
      <input type="hidden" name="id" value={row.id} />
      <input type="hidden" name="status" value={next} />
      <button className="min-h-10 rounded-control border border-cherie-burgundy px-3 text-xs font-bold text-cherie-burgundy">
        {next}
      </button>
    </form>
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
