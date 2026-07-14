import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminStatus,
  AdminToolbar,
} from './admin-workspace';

export type ResourceColumn<Row> = {
  label: string;
  value: (row: Row) => React.ReactNode;
  mobile?: boolean;
};
export function ResourceList<Row extends { id: string }>({
  eyebrow,
  title,
  description,
  rows,
  columns,
  total,
  createHref,
  createLabel,
  query,
  error,
}: {
  eyebrow: string;
  title: string;
  description: string;
  rows: Row[];
  columns: ResourceColumn<Row>[];
  total: number;
  createHref?: string;
  createLabel?: string;
  query?: string;
  error?: string;
}) {
  const action = createHref ? (
    <Link href={createHref} className="cherie-button-primary min-h-12 gap-2">
      <Plus className="size-4" aria-hidden="true" />
      {createLabel ?? 'Yeni kayıt oluştur'}
    </Link>
  ) : undefined;
  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow={eyebrow}
        title={title}
        description={`${description} Toplam ${total} kayıt bulunuyor.`}
        action={action}
      />
      {error && (
        <div
          role="alert"
          className="rounded-card border border-cherie-error/30 bg-cherie-error/10 p-4 text-sm leading-6 text-cherie-error"
        >
          {error}
        </div>
      )}
      <AdminToolbar label={`${title} arama araçları`}>
        <form className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-control border border-cherie-lace bg-cherie-ivory px-4">
            <Search className="size-4 shrink-0 text-cherie-soft-ink" aria-hidden="true" />
            <span className="sr-only">{title} içinde ara</span>
            <input
              name="q"
              defaultValue={query}
              placeholder={`${title} içinde ara`}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <button className="cherie-button-secondary min-h-12 px-5">
            Aramayı uygula
          </button>
        </form>
      </AdminToolbar>
      {!rows.length ? (
        <AdminEmptyState
          title={
            query ? `${title} aramasında sonuç yok` : `${title} çalışma alanı henüz boş`
          }
          description={
            query
              ? 'Arama ifadenizi sadeleştirin veya tüm kayıtları yeniden görüntüleyin.'
              : createHref
                ? `İlk ${title.toLocaleLowerCase('tr-TR')} kaydını oluşturarak bu çalışma alanını kullanmaya başlayın.`
                : 'Yeni kayıt geldiğinde operasyon ayrıntıları burada görünecek.'
          }
          primary={
            query
              ? { label: 'Tüm kayıtları göster', href: '?' }
              : createHref
                ? { label: createLabel ?? 'İlk kaydı oluştur', href: createHref }
                : { label: 'Görünümü yenile', href: '?' }
          }
        />
      ) : (
        <>
          <section
            aria-label={`${title} kayıtları`}
            className="admin-surface p-4 md:hidden"
          >
            {rows.map((row) => (
              <article key={row.id} className="admin-mobile-entity">
                {columns
                  .filter((c) => c.mobile !== false)
                  .map((column, index) => (
                    <div
                      key={column.label}
                      className={
                        index === 0
                          ? 'mb-3'
                          : 'mt-2 flex items-start justify-between gap-4'
                      }
                    >
                      <span
                        className={
                          index === 0
                            ? 'sr-only'
                            : 'text-xs font-bold uppercase tracking-wider text-cherie-soft-ink'
                        }
                      >
                        {column.label}
                      </span>
                      <div
                        className={
                          index === 0 ? 'text-base font-semibold' : 'text-right text-sm'
                        }
                      >
                        {column.value(row)}
                      </div>
                    </div>
                  ))}
              </article>
            ))}
          </section>
          <div className="admin-surface hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-cherie-paper/90">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.label} scope="col" className="px-5 py-4">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cherie-lace">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {columns.map((column) => (
                        <td key={column.label} className="px-5 py-4 align-top">
                          {column.value(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <p className="text-sm text-cherie-soft-ink">
        Toplam {total} kayıt · Bu görünüm en güncel 100 kaydı gösterir.
      </p>
    </div>
  );
}
export function StateBadge({ value }: { value: string }) {
  return <AdminStatus value={value} />;
}
export function AdminDate({ value }: { value?: string | null }) {
  if (!value) return <>—</>;
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat('tr-TR', {
        dateStyle: 'medium',
        timeZone: 'Europe/Istanbul',
      }).format(new Date(value))}
    </time>
  );
}
