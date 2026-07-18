import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminDate } from '@/components/admin/resource-list';
import {
  AdminNotice,
  AdminPageHeader,
  AdminStatus,
} from '@/components/admin/admin-workspace';
import { can } from '@/lib/admin/permissions';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteReview, moderateReview } from '../actions';

const ERROR_COPY: Record<string, string> = {
  permission: 'Bu işlem için yayınlama veya yönetici yetkisi gerekiyor.',
  invalid_action: 'Geçersiz bir moderasyon işlemi seçildi.',
  note_required: 'Reddetme ve gizleme işlemlerinde kısa bir gerekçe zorunludur.',
  delete_confirmation: 'Kalıcı silme için SIL ifadesini eksiksiz yazın.',
  hide_before_delete: 'Kalıcı silmeden önce değerlendirmeyi reddedin veya gizleyin.',
  not_found: 'Değerlendirme artık bulunamıyor.',
  invalid_input: 'Girilen bilgileri kontrol edip yeniden deneyin.',
  save_failed: 'İşlem kaydedilemedi. Bağlantıyı kontrol edip yeniden deneyin.',
};

export default async function ReviewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { staff } = await requireCapability(
    'content.read',
    `/admin/moderation/reviews/${id}`,
  );
  const db = createAdminClient();
  const { data: review, error } = await db
    .from('reviews')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !review) notFound();
  const customer = (
    await db
      .from('customers')
      .select('name,email')
      .eq('id', review.customer_id)
      .maybeSingle()
  ).data;
  const moderator = review.moderated_by
    ? (
        await db
          .from('staff_users')
          .select('name')
          .eq('id', review.moderated_by)
          .maybeSingle()
      ).data
    : null;
  const canModerate = can(staff.role, 'content.publish');
  const canDelete = ['admin', 'superadmin'].includes(staff.role);

  return (
    <div className="mx-auto max-w-5xl space-y-7 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="Değerlendirme ayrıntısı"
        title={review.title || 'Başlıksız değerlendirme'}
        description="Yayın kararını, gerekçeyi ve müşteri bağlamını tek bir denetlenebilir işlemde yönetin."
        action={
          <Link href="/admin/moderation/reviews" className="cherie-button-secondary">
            Listeye dön
          </Link>
        }
      />

      {query.error && (
        <AdminNotice tone="danger" title="İşlem tamamlanamadı">
          {ERROR_COPY[query.error] ?? ERROR_COPY.save_failed}
        </AdminNotice>
      )}
      {query.saved === 'moderated' && (
        <AdminNotice tone="success" title="Moderasyon kaydedildi">
          Yeni durum yayıma yansıdı ve denetim kaydı oluşturuldu.
        </AdminNotice>
      )}

      <section className="admin-surface space-y-6 p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-cherie-ink">
              {customer?.name || 'İsimsiz müşteri'}
            </p>
            <p className="mt-1 text-sm text-cherie-soft-ink">
              {customer?.email || 'E-posta kaydı yok'}
            </p>
          </div>
          <AdminStatus value={review.status} />
        </div>
        <dl className="grid gap-4 border-y border-cherie-lace py-5 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Puan" value={review.rating ? `${review.rating}/5` : '—'} />
          <Meta label="Konu" value={review.subject_type} />
          <Meta
            label="Doğrulanmış alışveriş"
            value={review.is_verified_purchase ? 'Evet' : 'Hayır'}
          />
          <Meta label="Gönderim" value={<AdminDate value={review.created_at} />} />
        </dl>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-cherie-soft-ink">
            Müşteri yorumu
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-cherie-ink">
            {review.body || 'Metin girilmemiş.'}
          </p>
        </div>
        <div className="rounded-card bg-cherie-paper p-4 text-sm leading-6 text-cherie-soft-ink">
          <strong className="text-cherie-ink">Son moderasyon:</strong>{' '}
          {review.moderated_at ? (
            <>
              <AdminDate value={review.moderated_at} /> ·{' '}
              {moderator?.name || 'Yetkili ekip üyesi'}
            </>
          ) : (
            'Henüz işlem yapılmadı.'
          )}
          {review.moderation_note && (
            <p className="mt-2">Gerekçe: {review.moderation_note}</p>
          )}
        </div>
      </section>

      {canModerate && (
        <section className="admin-surface p-5 md:p-7">
          <h2 className="admin-section-title">Yayın kararı</h2>
          <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
            Reddetme veya gizleme için gerekçe zorunludur. Onaylanan yorum herkese açık
            görünümde yayınlanır.
          </p>
          <form action={moderateReview} className="mt-5 space-y-4">
            <input type="hidden" name="id" value={review.id} />
            <label className="block">
              <span className="text-sm font-semibold text-cherie-ink">
                Moderasyon notu
              </span>
              <textarea
                name="note"
                defaultValue={review.moderation_note ?? ''}
                maxLength={1000}
                rows={4}
                className="cherie-field mt-2 w-full"
                placeholder="Kararın kısa ve nesnel gerekçesi"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button name="intent" value="approved" className="cherie-button-primary">
                Onayla ve yayınla
              </button>
              <button name="intent" value="rejected" className="cherie-button-secondary">
                Reddet
              </button>
              <button name="intent" value="hidden" className="cherie-button-secondary">
                Gizle
              </button>
            </div>
          </form>
        </section>
      )}

      {canDelete && (
        <section className="rounded-card border border-cherie-error/30 bg-cherie-error/5 p-5 md:p-7">
          <h2 className="admin-section-title text-cherie-error">Kalıcı silme</h2>
          <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
            Yalnızca reddedilmiş veya gizlenmiş değerlendirmeler silinebilir. Bu işlem
            geri alınamaz; denetim izi korunur.
          </p>
          <form
            action={deleteReview}
            className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="id" value={review.id} />
            <label className="flex-1">
              <span className="text-sm font-semibold text-cherie-ink">
                Onaylamak için SIL yazın
              </span>
              <input
                name="confirmation"
                autoComplete="off"
                className="cherie-field mt-2 w-full"
              />
            </label>
            <button className="min-h-12 rounded-control bg-cherie-error px-5 font-semibold text-white">
              Kalıcı olarak sil
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-cherie-soft-ink">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-cherie-ink">{value}</dd>
    </div>
  );
}
