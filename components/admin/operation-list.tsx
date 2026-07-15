import { AlertTriangle, Inbox } from 'lucide-react';
import { AdminPageHeader, AdminStatus } from './admin-workspace';
export type OperationColumn<Row> = {
  label: string;
  render: (row: Row) => React.ReactNode;
};
export function OperationList<Row extends { id: string }>({
  eyebrow,
  title,
  description,
  rows,
  columns,
  unavailable,
}: {
  eyebrow: string;
  title: string;
  description: string;
  rows: Row[];
  columns: OperationColumn<Row>[];
  unavailable: boolean;
}) {
  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader eyebrow={eyebrow} title={title} description={description} />
      {unavailable ? (
        <section
          role="alert"
          className="flex items-start gap-3 rounded-card border border-cherie-warning/30 bg-cherie-warning/10 p-5 text-sm leading-6"
        >
          <AlertTriangle
            className="mt-0.5 size-5 shrink-0 text-cherie-warning"
            aria-hidden="true"
          />
          <div>
            <p className="font-bold text-cherie-ink">
              Operasyon verisi şu anda kullanılamıyor
            </p>
            <p className="mt-1 text-cherie-soft-ink">
              Hiçbir kayıt değiştirilmedi. Bağlantı hazır olduğunda görünümü güvenle
              yenileyebilirsiniz.
            </p>
          </div>
        </section>
      ) : rows.length === 0 ? (
        <section className="admin-surface px-6 py-12 text-center shadow-none">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-cherie-success/10 text-cherie-success">
            <Inbox className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-3xl text-cherie-ink">
            Bekleyen iş bulunmuyor
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-cherie-soft-ink">
            Bu operasyon kuyruğu temiz. Yeni görev oluştuğunda burada önceliğiyle birlikte
            görünecek.
          </p>
        </section>
      ) : (
        <>
          <section
            aria-label={`${title} kayıtları`}
            className="admin-surface p-4 md:hidden"
          >
            {rows.map((row) => (
              <article key={row.id} className="admin-mobile-entity">
                {columns.map((column, index) => (
                  <div
                    key={column.label}
                    className={
                      index === 0
                        ? 'mb-3 text-base font-semibold'
                        : 'mt-2 flex items-start justify-between gap-4'
                    }
                  >
                    {index > 0 && (
                      <span className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
                        {column.label}
                      </span>
                    )}
                    <div className={index === 0 ? '' : 'text-right text-sm'}>
                      {column.render(row)}
                    </div>
                  </div>
                ))}
              </article>
            ))}
          </section>
          <div className="admin-surface hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-cherie-paper/90">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.label} scope="col" className="px-5 py-4">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cherie-lace/70">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {columns.map((column) => (
                        <td key={column.label} className="px-5 py-4 align-top">
                          {column.render(row)}
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
    </div>
  );
}
export function OperationalStatus({ value }: { value: string }) {
  return <AdminStatus value={value} />;
}
