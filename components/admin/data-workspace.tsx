import type { AdminCapability } from '@/lib/admin/permissions';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from './resource-list';
import { AdminPageHeader, AdminToolbar } from './admin-workspace';
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
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="Operasyon alanı"
        title={config.title}
        description={`${config.description} Toplam ${count ?? 0} kayıt bulunuyor.`}
      />
      <AdminToolbar label={`${config.title} arama araçları`}>
        <form className="flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            defaultValue={query}
            placeholder={`${config.title} içinde ara`}
            aria-label={`${config.title} içinde ara`}
            className="cherie-field flex-1"
          />
          <button className="cherie-button-secondary min-h-12">Aramayı uygula</button>
        </form>
      </AdminToolbar>
      {error ? (
        <p
          role="alert"
          className="rounded-card border border-cherie-error/30 bg-cherie-error/10 p-4 text-sm leading-6 text-cherie-error"
        >
          Kayıtlar okunamadı. Hiçbir değişiklik yapılmadı; bağlantıyı kontrol edip
          görünümü yeniden deneyin.
        </p>
      ) : (
        <>
          <section
            aria-label={`${config.title} kayıtları`}
            className="admin-surface p-4 md:hidden"
          >
            {rows.map((row, index) => (
              <article key={String(row.id ?? index)} className="admin-mobile-entity">
                {config.fields.map((field, fieldIndex) => (
                  <div
                    key={field.key}
                    className={
                      fieldIndex === 0
                        ? 'mb-3 font-semibold'
                        : 'mt-2 flex justify-between gap-4'
                    }
                  >
                    {fieldIndex > 0 && (
                      <span className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
                        {field.label}
                      </span>
                    )}
                    <div className={fieldIndex === 0 ? '' : 'text-right text-sm'}>
                      {display(row[field.key])}
                    </div>
                  </div>
                ))}
                {config.statusKey && (
                  <div className="mt-3">
                    <StateBadge value={String(row[config.statusKey] ?? '')} />
                  </div>
                )}
                {config.dateKey && (
                  <p className="mt-3 text-xs text-cherie-soft-ink">
                    <AdminDate
                      value={
                        typeof row[config.dateKey] === 'string'
                          ? (row[config.dateKey] as string)
                          : null
                      }
                    />
                  </p>
                )}
              </article>
            ))}
          </section>
          <div className="admin-surface hidden overflow-x-auto md:block">
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
                  <tr
                    key={String(row.id ?? index)}
                    className="border-t border-cherie-lace"
                  >
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
        </>
      )}
    </div>
  );
}
function display(value: unknown) {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.length ? `${value.length} öğe` : '—';
  return `${Object.keys(value as Record<string, unknown>).length} yapılandırılmış alan`;
}
