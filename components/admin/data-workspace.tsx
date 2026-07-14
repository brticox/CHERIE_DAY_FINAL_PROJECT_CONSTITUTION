import type { AdminCapability } from '@/lib/admin/permissions';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from './resource-list';
type Config = {
  path: string;
  title: string;
  description: string;
  table: string;
  capability: AdminCapability;
  fields: readonly { key: string; label: string }[];
  statusKey?: string;
  dateKey?: string;
};
export async function DataWorkspace({
  config,
  query,
}: {
  config: Config;
  query?: string;
}) {
  await requireCapability(config.capability, config.path);
  const db = createAdminClient();
  let request = db
    .from(config.table as 'faqs')
    .select('*', { count: 'exact' })
    .limit(150);
  if (query && config.fields[0])
    request = request.ilike(
      config.fields[0].key as 'question',
      `%${query.replace(/[,%]/g, '')}%`,
    );
  const { data, count, error } = await request;
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-cherie-brass">
          Operasyon workspace
        </p>
        <h1 className="font-display text-4xl">{config.title}</h1>
        <p className="text-sm text-cherie-soft-ink">
          {config.description} · {count ?? 0} kayıt
        </p>
      </header>
      <form>
        <input
          name="q"
          defaultValue={query}
          placeholder="Ara"
          className="cherie-field max-w-lg"
        />
      </form>
      {error ? (
        <p role="alert" className="rounded-control bg-cherie-error/10 p-3">
          Veri okunamadı: tablo/migration hazır olmalı.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card-lg border border-cherie-lace">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cherie-paper">
              <tr>
                {config.fields.map((x) => (
                  <th key={x.key} className="p-3">
                    {x.label}
                  </th>
                ))}
                {config.statusKey && <th>Durum</th>}
                {config.dateKey && <th>Zaman</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={String(row.id ?? index)} className="border-t border-cherie-lace">
                  {config.fields.map((field) => (
                    <td key={field.key} className="max-w-sm p-3">
                      {display(row[field.key])}
                    </td>
                  ))}
                  {config.statusKey && (
                    <td>
                      <StateBadge value={String(row[config.statusKey] ?? '—')} />
                    </td>
                  )}
                  {config.dateKey && (
                    <td>
                      <AdminDate
                        value={
                          typeof row[config.dateKey] === 'string'
                            ? (row[config.dateKey] as string)
                            : null
                        }
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
function display(value: unknown) {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.length ? `${value.length} öğe` : '—';
  return (
    <details>
      <summary className="cursor-pointer text-cherie-burgundy">Detay</summary>
      <pre className="max-w-md overflow-auto text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}
