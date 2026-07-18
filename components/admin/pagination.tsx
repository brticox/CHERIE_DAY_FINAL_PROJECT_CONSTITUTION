import Link from 'next/link';

type QueryValue = string | undefined;

export function AdminPagination({
  path,
  page,
  pageSize,
  total,
  query = {},
  label = 'Kayıt sayfalama',
}: {
  path: string;
  page: number;
  pageSize: number;
  total: number;
  query?: Record<string, QueryValue>;
  label?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    params.set('page', String(target));
    return `${path}?${params.toString()}`;
  };

  return (
    <nav aria-label={label} className="admin-surface flex items-center justify-between gap-4 p-4">
      <span className="text-sm text-cherie-soft-ink">
        Sayfa {page} / {pages} · {total} kayıt
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className="cherie-button-secondary min-h-11">
            Önceki
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className="cherie-button-secondary min-h-11">
            Sonraki
          </Link>
        )}
      </div>
    </nav>
  );
}
