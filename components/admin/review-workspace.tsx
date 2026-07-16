import Link from 'next/link';

import { can } from '@/lib/admin/permissions';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminStatus,
  AdminToolbar,
} from './admin-workspace';
import { AdminDate } from './resource-list';

type Review = Database['public']['Tables']['reviews']['Row'];
type ReviewStatus = Database['public']['Enums']['review_status'];
type ReviewSearch = { q?: string; status?: string; page?: string; deleted?: string };

const PAGE_SIZE = 25;
const STATUSES: Array<{ value: ReviewStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending', label: 'Bekleyen' },
  { value: 'approved', label: 'Yayında' },
  { value: 'rejected', label: 'Reddedilen' },
  { value: 'hidden', label: 'Gizlenen' },
];

export async function ReviewWorkspace({
  query,
  queueOnly = false,
}: {
  query: ReviewSearch;
  queueOnly?: boolean;
}) {
  const path = queueOnly ? '/admin/moderation/queue' : '/admin/moderation/reviews';
  const { staff } = await requireCapability('content.read', path);
  const page = positiveInteger(query.page);
  const searched = cleanSearch(query.q);
  const requestedStatus = STATUSES.some((item) => item.value === query.status)
    ? (query.status as ReviewStatus | 'all')
    : 'all';
  const status: ReviewStatus | 'all' = queueOnly ? 'pending' : requestedStatus;
  const from = (page - 1) * PAGE_SIZE;
  const db = createAdminClient();

  let request = db
    .from('reviews')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (status !== 'all') request = request.eq('status', status);
  if (searched) request = request.ilike('body', `%${searched}%`);
  const result = await request.range(from, from + PAGE_SIZE - 1);
  const rows = (result.data ?? []) as Review[];
  const total = result.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const customerIds = [...new Set(rows.map((row) => row.customer_id))];
  const customers = customerIds.length
    ? ((await db.from('customers').select('id,name,email').in('id', customerIds)).data ??
      [])
    : [];
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const canModerate = can(staff.role, 'content.publish');

  return (
    <div className="mx-auto max-w-[1680px] space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="İçerik güvenliği"
        title={queueOnly ? 'Moderasyon kuyruğu' : 'Müşteri değerlendirmeleri'}
        description={`${queueOnly ? 'Yayın kararı bekleyen' : 'Yayınlanmış ve bekleyen'} gerçek müşteri yorumlarını yönetin. Toplam ${total} kayıt.`}
      />

      {query.deleted === '1' && (
        <p
          role="status"
          className="rounded-card border border-emerald-700/20 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          Değerlendirme silindi ve işlem denetim kaydına işlendi.
        </p>
      )}

      <AdminToolbar label="Değerlendirme filtreleri">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {!queueOnly && (
            <nav aria-label="Duruma göre filtrele" className="flex flex-wrap gap-2">
              {STATUSES.map((item) => (
                <Link
                  key={item.value}
                  href={reviewHref({ status: item.value, q: searched })}
                  aria-current={status === item.value ? 'page' : undefined}
                  className={
                    status === item.value
                      ? 'cherie-button-primary min-h-10 px-4'
                      : 'cherie-button-secondary min-h-10 px-4'
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          <form className="flex min-w-0 flex-1 gap-2 xl:max-w-xl">
            {!queueOnly && status !== 'all' && (
              <input type="hidden" name="status" value={status} />
            )}
            <input
              name="q"
              defaultValue={searched}
              aria-label="Yorum metninde ara"
              placeholder="Yorum metninde ara"
              className="cherie-field min-w-0 flex-1"
            />
            <button className="cherie-button-secondary min-h-12">Ara</button>
          </form>
        </div>
      </AdminToolbar>

      {result.error ? (
        <p
          role="alert"
          className="rounded-card border border-cherie-error/30 bg-cherie-error/10 p-4 text-sm text-cherie-error"
        >
          Değerlendirmeler okunamadı. Bağlantıyı kontrol edip yeniden deneyin.
        </p>
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title={searched ? 'Aramayla eşleşen yorum yok' : 'Bu görünümde yorum yok'}
          description={
            searched
              ? 'Arama ifadesini sadeleştirin veya tüm değerlendirmelere dönün.'
              : 'Yeni bir müşteri değerlendirmesi geldiğinde burada görünecek.'
          }
          primary={{
            label: 'Tüm değerlendirmeleri göster',
            href: '/admin/moderation/reviews',
          }}
        />
      ) : (
        <>
          <section aria-label="Değerlendirmeler" className="grid gap-4 lg:grid-cols-2">
            {rows.map((review) => {
              const customer = customerById.get(review.customer_id);
              return (
                <article key={review.id} className="admin-surface flex flex-col p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-cherie-ink">
                        {customer?.name || 'İsimsiz müşteri'}
                      </p>
                      <p className="mt-1 text-xs text-cherie-soft-ink">
                        {review.subject_type} ·{' '}
                        {review.rating ? `${review.rating}/5` : 'Puan yok'}
                      </p>
                    </div>
                    <AdminStatus value={review.status} />
                  </div>
                  <h2 className="mt-5 font-semibold text-cherie-ink">
                    {review.title || 'Başlıksız değerlendirme'}
                  </h2>
                  <p className="mt-2 line-clamp-4 flex-1 text-sm leading-6 text-cherie-soft-ink">
                    {review.body || 'Metin girilmemiş.'}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-cherie-lace pt-4">
                    <span className="text-xs text-cherie-soft-ink">
                      <AdminDate value={review.created_at} />
                    </span>
                    <Link
                      href={`/admin/moderation/reviews/${review.id}`}
                      className="cherie-button-secondary min-h-10 px-4"
                    >
                      {canModerate ? 'İncele ve yönet' : 'Ayrıntıyı gör'}
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
          <nav aria-label="Sayfalar" className="flex items-center justify-between gap-4">
            <Link
              href={reviewHref({
                status,
                q: searched,
                page: Math.max(1, page - 1),
                queueOnly,
              })}
              aria-disabled={page <= 1}
              className={`cherie-button-secondary min-h-11 ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
            >
              Önceki
            </Link>
            <p className="text-sm text-cherie-soft-ink">
              Sayfa {Math.min(page, pageCount)} / {pageCount}
            </p>
            <Link
              href={reviewHref({
                status,
                q: searched,
                page: Math.min(pageCount, page + 1),
                queueOnly,
              })}
              aria-disabled={page >= pageCount}
              className={`cherie-button-secondary min-h-11 ${page >= pageCount ? 'pointer-events-none opacity-40' : ''}`}
            >
              Sonraki
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}

function cleanSearch(value?: string) {
  return (
    value
      ?.trim()
      .replace(/[%_,()]/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 100) ?? ''
  );
}

function positiveInteger(value?: string) {
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function reviewHref({
  status,
  q,
  page,
  queueOnly = false,
}: {
  status?: ReviewStatus | 'all';
  q?: string;
  page?: number;
  queueOnly?: boolean;
}) {
  const params = new URLSearchParams();
  if (!queueOnly && status && status !== 'all') params.set('status', status);
  if (q) params.set('q', q);
  if (page && page > 1) params.set('page', String(page));
  const base = queueOnly ? '/admin/moderation/queue' : '/admin/moderation/reviews';
  return params.size ? `${base}?${params}` : base;
}
