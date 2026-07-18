import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate } from '@/components/admin/resource-list';
import {
  AdminNotice,
  AdminPageHeader,
  AdminToolbar,
} from '@/components/admin/admin-workspace';
import { adminEventLabel } from '@/lib/admin/presentation';
import { roleLabel } from '@/lib/admin/permissions';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    action?: string;
    entity?: string;
    actor?: string;
    source?: string;
  }>;
}) {
  const f = await searchParams;
  await requireCapability('audit.read', '/admin/audit-log');
  const db = createAdminClient();
  let query = db
    .from('audit_log')
    .select(
      'id,action,entity_type,entity_id,diff,context,correlation_id,source,created_at,staff_users(name,role)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .limit(250);
  if (f.q)
    query = query.or(`action.ilike.%${safe(f.q)}%,entity_type.ilike.%${safe(f.q)}%`);
  if (f.action) query = query.ilike('action', `%${safe(f.action)}%`);
  if (f.entity) query = query.eq('entity_type', f.entity);
  if (f.source) query = query.eq('source', f.source);
  if (f.actor) query = query.eq('staff_user_id', f.actor);
  const [{ data, count, error }, staff] = await Promise.all([
    query,
    db.from('staff_users').select('id,name').order('name'),
  ]);
  return (
    <div className="space-y-7 p-4 md:p-8">
      <AdminPageHeader
        eyebrow="Değiştirilemez operasyon izi"
        title="Denetim günlüğü"
        description={`${count ?? 0} güvenli kayıt · Hassas bilgiler arayüzde otomatik olarak maskelenir.`}
      />
      <AdminToolbar label="Denetim filtreleri">
        <form className="grid gap-3 md:grid-cols-6">
          <input
            aria-label="Denetim günlüğünde ara"
            name="q"
            defaultValue={f.q}
            placeholder="Ara"
            className="cherie-field"
          />
          <input
            aria-label="Aksiyon filtresi"
            name="action"
            defaultValue={f.action}
            placeholder="İşlem türü"
            className="cherie-field"
          />
          <input
            aria-label="Varlık filtresi"
            name="entity"
            defaultValue={f.entity}
            placeholder="Kayıt türü"
            className="cherie-field"
          />
          <select
            aria-label="Aktör filtresi"
            name="actor"
            defaultValue={f.actor ?? ''}
            className="cherie-field"
          >
            <option value="">Tüm aktörler</option>
            {(staff.data ?? []).map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          <input
            aria-label="Kaynak filtresi"
            name="source"
            defaultValue={f.source}
            placeholder="Kaynak"
            className="cherie-field"
          />
          <button className="cherie-button-primary">Filtrele</button>
        </form>
      </AdminToolbar>
      {error ? (
        <AdminNotice tone="danger" title="Denetim günlüğü okunamıyor">
          Hiçbir kayıt değiştirilmedi. Bağlantıyı kontrol ettikten sonra yeniden
          deneyebilirsiniz.
        </AdminNotice>
      ) : (
        <div className="admin-surface overflow-hidden">
          <div className="divide-y divide-cherie-lace p-5 md:hidden">
            {(data ?? []).map((item) => (
              <article key={item.id} className="admin-mobile-entity">
                <div className="flex items-start justify-between gap-3">
                  <strong>{adminEventLabel(item.action)}</strong>
                  <AdminDate value={item.created_at} />
                </div>
                <p className="mt-2 text-sm text-cherie-soft-ink">
                  {item.staff_users?.name ?? 'Sistem'} ·{' '}
                  {item.staff_users?.role
                    ? roleLabel(item.staff_users.role)
                    : 'Otomatik işlem'}
                </p>
                <p className="mt-1 text-xs text-cherie-soft-ink">
                  {entityLabel(item.entity_type)} ·{' '}
                  {item.entity_id?.slice(0, 8) ?? 'Numara yok'}
                </p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-cherie-paper">
                <tr>
                  <th className="p-3">Zaman</th>
                  <th>Aktör / rol</th>
                  <th>İşlem</th>
                  <th>Kayıt türü</th>
                  <th>Kaynak / korelasyon</th>
                  <th>Önce / sonra</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((x) => (
                  <tr key={x.id} className="border-t border-cherie-lace align-top">
                    <td className="p-3">
                      <AdminDate value={x.created_at} />
                    </td>
                    <td>
                      {x.staff_users?.name ?? 'Sistem'}
                      <small className="block">
                        {x.staff_users?.role
                          ? roleLabel(x.staff_users.role)
                          : 'Otomatik işlem'}
                      </small>
                    </td>
                    <td className="font-bold">{adminEventLabel(x.action)}</td>
                    <td>
                      {entityLabel(x.entity_type)}
                      <small className="block">{x.entity_id?.slice(0, 8) ?? '—'}</small>
                    </td>
                    <td>
                      {sourceLabel(x.source)}
                      <small className="block font-mono">
                        {x.correlation_id.slice(0, 8)}…
                      </small>
                    </td>
                    <td>
                      <details>
                        <summary className="cursor-pointer text-cherie-burgundy">
                          Özet
                        </summary>
                        <p className="mt-2 max-w-xl text-xs leading-5 text-cherie-soft-ink">
                          Hassas bilgiler maskelenmiştir. Değişiklik kaydı{' '}
                          {changeCount(redact(x.diff))} alan içeriyor.
                        </p>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
const safe = (v: string) => v.replace(/[,%]/g, '');
function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        /email|phone|token|secret|password|address/i.test(k) ? k : k,
        /email|phone|token|secret|password|address/i.test(k) ? '[REDACTED]' : redact(v),
      ]),
    );
  }
  return value;
}

function entityLabel(value: string | null) {
  if (!value) return 'Sistem kaydı';
  return (
    (
      {
        customer: 'Müşteri',
        order: 'Sipariş',
        product: 'Ürün',
        payment: 'Ödeme',
        notification: 'Bildirim',
        staff_user: 'Personel',
        legal_document_version: 'Yasal belge sürümü',
      } as Record<string, string>
    )[value] ?? 'Operasyon kaydı'
  );
}

function changeCount(value: unknown) {
  if (!value || typeof value !== 'object') return value == null ? 0 : 1;
  return Array.isArray(value) ? value.length : Object.keys(value).length;
}

function sourceLabel(value: string | null) {
  return value === 'admin'
    ? 'Yönetim arayüzü'
    : value === 'system'
      ? 'Sistem'
      : value === 'webhook'
        ? 'Sağlayıcı bildirimi'
        : 'Uygulama';
}
