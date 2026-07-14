import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate } from '@/components/admin/resource-list';
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
  await requireStaff('/admin/audit-log');
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
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Değiştirilemez operasyon izi
        </p>
        <h1 className="font-display text-4xl">Audit log</h1>
        <p className="text-sm text-cherie-soft-ink">
          {count ?? 0} kayıt · Hassas anahtarlar arayüzde redakte edilir.
        </p>
      </header>
      <form className="grid gap-3 rounded-card-lg border border-cherie-lace p-4 md:grid-cols-6">
        <input aria-label="Denetim günlüğünde ara" name="q" defaultValue={f.q} placeholder="Ara" className="cherie-field" />
        <input
          aria-label="Aksiyon filtresi"
          name="action"
          defaultValue={f.action}
          placeholder="Aksiyon"
          className="cherie-field"
        />
        <input
          aria-label="Varlık filtresi"
          name="entity"
          defaultValue={f.entity}
          placeholder="Entity"
          className="cherie-field"
        />
        <select aria-label="Aktör filtresi" name="actor" defaultValue={f.actor ?? ''} className="cherie-field">
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
      {error ? (
        <p>Audit kayıtları okunamadı.</p>
      ) : (
        <div className="overflow-x-auto rounded-card-lg border border-cherie-lace">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-cherie-paper">
              <tr>
                <th className="p-3">Zaman</th>
                <th>Aktör / rol</th>
                <th>Aksiyon</th>
                <th>Entity</th>
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
                    <small className="block">{x.staff_users?.role ?? 'worker'}</small>
                  </td>
                  <td className="font-bold">{x.action}</td>
                  <td>
                    {x.entity_type ?? '—'}
                    <small className="block">{x.entity_id?.slice(0, 8) ?? '—'}</small>
                  </td>
                  <td>
                    {x.source}
                    <small className="block font-mono">
                      {x.correlation_id.slice(0, 8)}…
                    </small>
                  </td>
                  <td>
                    <details>
                      <summary className="cursor-pointer text-cherie-burgundy">
                        Özet
                      </summary>
                      <pre className="mt-2 max-h-64 max-w-xl overflow-auto whitespace-pre-wrap text-xs">
                        {JSON.stringify(redact(x.diff), null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
