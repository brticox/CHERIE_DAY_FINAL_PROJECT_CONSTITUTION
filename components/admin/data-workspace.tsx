import type { AdminCapability } from '@/lib/admin/permissions';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from './resource-list';
import { AdminPageHeader, AdminToolbar } from './admin-workspace';
import Link from 'next/link';
import { canWriteManagedResource, getManagedResource, type ManagedResourceKey } from '@/lib/admin/managed-resources';
type Config = {
  path: string;
  title: string;
  description: string;
  table: string;
  capability: AdminCapability;
  fields: readonly { key: string; label: string }[];
  statusKey?: string;
  dateKey?: string;
  manageResource?: ManagedResourceKey;
};
export async function DataWorkspace({
  config,
  query,
  page = 1,
}: {
  config: Config;
  query?: string;
  page?: number;
}) {
  const { staff } = await requireCapability(config.capability, config.path);
  const managedResource = config.manageResource ? getManagedResource(config.manageResource) : null;
  const mayCreate = managedResource ? canWriteManagedResource(staff.role, managedResource) : false;
  const db = createAdminClient();
  const pageSize = 25;
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * pageSize;
  let request = db
    .from(config.table as 'faqs')
    .select('*', { count: 'exact' });
  if (query && config.fields[0])
    request = request.ilike(
      config.fields[0].key as 'question',
      `%${query.replace(/[,%]/g, '')}%`,
    );
  const { data, count, error } = await request
    .order((config.dateKey ?? 'id') as 'id', { ascending: false })
    .range(from, from + pageSize - 1);
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="Operasyon alanı"
        title={config.title}
        description={`${config.description} Toplam ${count ?? 0} kayıt bulunuyor.`}
      />
      {config.manageResource && mayCreate && (
        <div className="flex justify-end">
          <Link
            href={`/admin/manage/${config.manageResource}/new`}
            className="cherie-button-primary min-h-12"
          >
            Yeni kayıt oluştur
          </Link>
        </div>
      )}
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
                {config.manageResource && Boolean(row.id) && (
                  <Link
                    href={`/admin/manage/${config.manageResource}/${String(row.id)}`}
                    className="cherie-button-secondary mt-4 inline-flex min-h-11 items-center"
                  >
                    Ayrıntı ve düzenleme
                  </Link>
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
                  {config.manageResource && <th className="p-3">İşlem</th>}
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
                    {config.manageResource && Boolean(row.id) && (
                      <td className="p-3">
                        <Link
                          href={`/admin/manage/${config.manageResource}/${String(row.id)}`}
                          className="font-semibold text-cherie-plum underline-offset-4 hover:underline"
                        >
                          Aç ve düzenle
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            path={config.path}
            page={safePage}
            pageSize={pageSize}
            total={count ?? 0}
            query={query}
          />
        </>
      )}
    </div>
  );
}

function Pagination({ path, page, pageSize, total, query }: {
  path: string; page: number; pageSize: number; total: number; query?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (next: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', String(next));
    return `${path}?${params.toString()}`;
  };
  return (
    <nav aria-label="Sayfalama" className="admin-surface flex items-center justify-between gap-4 p-4">
      <span className="text-sm text-cherie-soft-ink">Sayfa {page} / {pages}</span>
      <div className="flex gap-2">
        {page > 1 && <Link href={href(page - 1)} className="cherie-button-secondary min-h-11">Önceki</Link>}
        {page < pages && <Link href={href(page + 1)} className="cherie-button-secondary min-h-11">Sonraki</Link>}
      </div>
    </nav>
  );
}
function display(value: unknown) {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.length ? `${value.length} öğe` : '—';
  return `${Object.keys(value as Record<string, unknown>).length} yapılandırılmış alan`;
}
