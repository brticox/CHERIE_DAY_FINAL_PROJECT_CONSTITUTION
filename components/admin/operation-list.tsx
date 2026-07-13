import { AlertTriangle, Inbox } from 'lucide-react';

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
    <div className="space-y-8 p-5 md:p-8">
      <header>
        <p className="text-xs uppercase tracking-[.18em] text-cherie-brass">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-cherie-soft-ink">
          {description}
        </p>
      </header>
      {unavailable ? (
        <div className="rounded-card-lg border border-cherie-warning/30 bg-cherie-warning/10 p-5 text-sm">
          <AlertTriangle className="mr-2 inline size-4" /> Veritabanı bu ortamda
          yapılandırılmamış.
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-card-lg border border-dashed border-cherie-lace bg-cherie-paper/50 px-6 py-14 text-center">
          <Inbox className="mx-auto size-7 text-cherie-brass" />
          <h2 className="mt-4 font-display text-2xl">Bekleyen kayıt yok</h2>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-ivory shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-cherie-paper text-xs uppercase tracking-wide text-cherie-soft-ink">
                <tr>
                  {columns.map((column) => (
                    <th key={column.label} className="px-5 py-4">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cherie-lace/70">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-cherie-paper/40">
                    {columns.map((column) => (
                      <td key={column.label} className="px-5 py-4">
                        {column.render(row)}
                      </td>
                    ))}
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

export function OperationalStatus({ value }: { value: string }) {
  const tone = ['approved', 'passed', 'completed', 'delivered'].includes(value)
    ? 'bg-cherie-success/10 text-cherie-success'
    : ['failed', 'rejected', 'returned'].includes(value)
      ? 'bg-cherie-error/10 text-cherie-error'
      : 'bg-cherie-warning/10 text-cherie-warning';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
    >
      {value}
    </span>
  );
}
