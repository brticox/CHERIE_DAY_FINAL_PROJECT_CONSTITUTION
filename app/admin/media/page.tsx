import { ResourceList, AdminDate, StateBadge } from '@/components/admin/resource-list';
import { MediaUploader } from '@/components/admin/media-uploader';
import { archiveMedia, updateMediaMetadata } from './actions';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; error?: string }>;
}) {
  const { q, state, error: message } = await searchParams;
  await requireCapability('catalog.read', '/admin/media');
  const db = createAdminClient();
  let request = db
    .from('media_assets')
    .select(
      'id,title,alt_text,type,mime_type,size_bytes,width,height,bucket,storage_path,url,tags,is_public,linked_entity_type,created_at,archived_at,focal_x,focal_y',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .limit(100);
  request =
    state === 'archived'
      ? request.not('archived_at', 'is', null)
      : request.is('archived_at', null);
  if (q)
    request = request.or(
      `alt_text.ilike.%${q.replace(/[,%]/g, '')}%,title.ilike.%${q.replace(/[,%]/g, '')}%`,
    );
  const [{ data, count, error }, products, seo] = await Promise.all([
    request,
    db.from('products').select('id,name,media_ids'),
    db.from('seo_metadata').select('id,og_image_id').not('og_image_id', 'is', null),
  ]);
  const rows = (data ?? []).map((asset) => {
    const productRefs = (products.data ?? [])
      .filter((product) => product.media_ids.includes(asset.id))
      .map((product) => product.name);
    const seoRefs = (seo.data ?? []).filter(
      (item) => item.og_image_id === asset.id,
    ).length;
    return { ...asset, usage: productRefs.length + seoRefs, usageLabels: productRefs };
  });
  return (
    <>
      <div className="mx-auto max-w-[1680px] px-4 pt-4 md:px-7 md:pt-7 xl:px-9 xl:pt-9">
        <MediaUploader />
        {message && (
          <p
            role="alert"
            className="mt-3 rounded-control bg-cherie-error/10 p-3 text-sm text-cherie-error"
          >
            {message}
          </p>
        )}
        <nav className="mt-4 flex gap-2 text-sm">
          <a href="/admin/media" className="cherie-button-secondary">
            Aktif
          </a>
          <a href="/admin/media?state=archived" className="cherie-button-secondary">
            Arşiv
          </a>
        </nav>
      </div>
      <ResourceList
        eyebrow="İçerik"
        title="Medya Kütüphanesi"
        description="Magic-byte, MIME, boyut ve tekrar kontrolünden geçen dosyaları; odak noktası, alternatif metin ve gerçek kullanım ilişkileriyle yönetin."
        rows={rows}
        total={count ?? 0}
        query={q}
        error={error ? 'Medya kayıtları okunamadı.' : undefined}
        columns={[
          {
            label: 'Dosya',
            value: (r) => (
              <>
                <strong>{r.title || r.alt_text || 'Başlıksız medya'}</strong>
                <p className="max-w-xs truncate text-xs text-cherie-soft-ink">
                  {r.alt_text || 'Alternatif metin eksik'}
                </p>
              </>
            ),
          },
          {
            label: 'Teknik',
            value: (r) => (
              <>
                <span>{r.mime_type ?? r.type}</span>
                <p className="text-xs text-cherie-soft-ink">
                  {r.width && r.height ? `${r.width}×${r.height}` : '—'} ·{' '}
                  {r.size_bytes ? `${(r.size_bytes / 1024 / 1024).toFixed(2)} MB` : '—'}
                </p>
              </>
            ),
          },
          {
            label: 'Erişim',
            value: (r) => (
              <StateBadge
                value={
                  r.archived_at ? 'archived' : r.is_public ? 'published' : 'internal'
                }
              />
            ),
          },
          {
            label: 'Kullanım',
            value: (r) => (
              <>
                <strong>{r.usage ? r.usage : 'Yetim'}</strong>
                {r.usageLabels.length > 0 && (
                  <p className="max-w-48 truncate text-xs text-cherie-soft-ink">
                    {r.usageLabels.join(', ')}
                  </p>
                )}
              </>
            ),
          },
          { label: 'Yükleme', value: (r) => <AdminDate value={r.created_at} /> },
          {
            label: 'Düzenle',
            value: (r) => (
              <details>
                <summary className="cursor-pointer text-sm font-bold text-cherie-burgundy">
                  Ayarlar
                </summary>
                <form action={updateMediaMetadata} className="mt-2 grid min-w-64 gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <input
                    name="title"
                    aria-label="Başlık"
                    defaultValue={r.title ?? ''}
                    placeholder="Başlık"
                    className="cherie-field"
                  />
                  <input
                    name="alt_text"
                    aria-label="Alternatif metin"
                    defaultValue={r.alt_text ?? ''}
                    placeholder="Alternatif metin"
                    className="cherie-field"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="focal_x"
                      aria-label="Yatay odak"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue={r.focal_x}
                      className="cherie-field"
                    />
                    <input
                      name="focal_y"
                      aria-label="Dikey odak"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue={r.focal_y}
                      className="cherie-field"
                    />
                  </div>
                  <button className="cherie-button-secondary">Kaydet</button>
                </form>
                {!r.archived_at && (
                  <form action={archiveMedia} className="mt-2">
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      disabled={r.usage > 0}
                      title={r.usage > 0 ? 'Kullanımdaki medya arşivlenemez.' : ''}
                      className="text-sm font-bold text-cherie-error disabled:opacity-40"
                    >
                      Güvenli arşivle
                    </button>
                  </form>
                )}
              </details>
            ),
          },
        ]}
      />
    </>
  );
}
