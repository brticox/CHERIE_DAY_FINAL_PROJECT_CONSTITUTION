import Link from 'next/link';
import { OperationList, OperationalStatus } from '@/components/admin/operation-list';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
import { ProofUploader } from '@/components/admin/proof-uploader';
import { jsonText } from '@/lib/orders/customer';
import { updateProofAssignment } from './actions';

type Proof = Database['public']['Tables']['product_proofs']['Row'] & {
  orders: { order_number: string } | null;
};
export const dynamic = 'force-dynamic';
export default async function Page() {
  let rows: Proof[] = [];
  let proofItems: { id: string; label: string }[] = [];
  let staffRows: { id: string; name: string }[] = [];
  let unavailable = true;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const db = createAdminClient();
    const [{ data, error }, items, staff] = await Promise.all([
      db
        .from('product_proofs')
        .select('*,orders(order_number)')
        .order('created_at', { ascending: false })
        .limit(100),
      db
        .from('order_items')
        .select('id,product_snapshot,orders!inner(order_number,status)')
        .eq('requires_proof', true)
        .in('orders.status', ['paid', 'in_design', 'revision_requested'])
        .limit(100),
      db.from('staff_users').select('id,name').eq('is_active', true).order('name'),
    ]);
    rows = (data ?? []) as Proof[];
    proofItems = (items.data ?? []).map((item) => ({
      id: item.id,
      label: `${item.orders.order_number} · ${jsonText(item.product_snapshot, 'name', 'Ürün')}`,
    }));
    staffRows = staff.data ?? [];
    unavailable = Boolean(error);
  }
  return (
    <div className="space-y-6">
      <div className="px-4 pt-4 md:px-8 md:pt-8">
        <ProofUploader items={proofItems} />
      </div>
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
          {
            label: 'Gönderim / termin',
            render: (r) => (
              <>
                {date(r.sent_at ?? r.created_at)}
                <p className="text-xs text-cherie-soft-ink">
                  {r.due_at ? `Termin: ${date(r.due_at)}` : 'Termin yok'}
                </p>
              </>
            ),
          },
          {
            label: 'Atama',
            render: (r) => (
              <details>
                <summary className="cursor-pointer text-xs font-bold text-cherie-burgundy">
                  Düzenle
                </summary>
                <form action={updateProofAssignment} className="mt-2 grid min-w-64 gap-2">
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
                  <button className="cherie-button-secondary">Kaydet</button>
                </form>
              </details>
            ),
          },
        ]}
      />
    </div>
  );
}
function date(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}
