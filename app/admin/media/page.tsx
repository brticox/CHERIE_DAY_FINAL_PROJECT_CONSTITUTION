import Image from 'next/image';
import Link from 'next/link';
import { Archive, FileText, Search } from 'lucide-react';

import {
  AdminEmptyState,
  AdminHelperText,
  AdminMetadata,
  AdminPageHeader,
  AdminSectionHeading,
  AdminSegmentedControl,
  AdminToolbar,
} from '@/components/admin/admin-workspace';
import { MediaUploader } from '@/components/admin/media-uploader';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import { requireCapability } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { archiveMedia, updateMediaMetadata } from './actions';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; error?: string }>;
}) {
  const { q, state, error: message } = await searchParams;
  await requireCapability('catalog.read', '/admin/media');
  const db = createAdminClient();
  const archived = state === 'archived';
  let request = db
    .from('media_assets')
    .select(
      'id,title,alt_text,type,mime_type,size_bytes,width,height,bucket,storage_path,url,tags,is_public,linked_entity_type,created_at,archived_at,focal_x,focal_y',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .limit(100);
  request = archived ? request.not('archived_at', 'is', null) : request.is('archived_at', null);
  if (q) {
    request = request.or(
      `alt_text.ilike.%${q.replace(/[,%]/g, '')}%,title.ilike.%${q.replace(/[,%]/g, '')}%`,
    );
  }

  const [{ data, count, error }, products, seo, activeCount, archiveCount] = await Promise.all([
    request,
    db.from('products').select('id,name,media_ids'),
    db.from('seo_metadata').select('id,og_image_id').not('og_image_id', 'is', null),
    db.from('media_assets').select('id', { count: 'exact', head: true }).is('archived_at', null),
    db.from('media_assets').select('id', { count: 'exact', head: true }).not('archived_at', 'is', null),
  ]);

  const rows = (data ?? []).map((asset) => {
    const productRefs = (products.data ?? [])
      .filter((product) => product.media_ids.includes(asset.id))
      .map((product) => product.name);
    const seoRefs = (seo.data ?? []).filter((item) => item.og_image_id === asset.id).length;
    return { ...asset, usage: productRefs.length + seoRefs, usageLabels: productRefs };
  });

  const hasSearch = Boolean(q?.trim());

  return (
    <div className="mx-auto max-w-[1680px] space-y-8 p-4 md:p-7 xl:p-9">
      <AdminPageHeader
        eyebrow="İçerik operasyonu"
        title="Medya Kütüphanesi"
        description="Ürün, koleksiyon ve içeriklerde kullanılan görselleri güvenle yükleyin; erişilebilirlik, teknik nitelikler ve kullanım ilişkileriyle yönetin."
        action={<Link href="#media-upload" className="cherie-button-primary min-h-11">Yeni medya yükle</Link>}
      />

      <section id="media-upload" aria-labelledby="media-upload-heading" className="scroll-mt-24">
        <span id="media-upload-heading" className="sr-only">Yeni medya yükleme alanı</span>
        <MediaUploader />
        <details id="upload-rules" className="mt-3 rounded-control border border-cherie-lace bg-white/40 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-cherie-burgundy">Yükleme kurallarını gör</summary>
          <AdminHelperText className="mt-2">
            Dosyalar sunucuda MIME, gerçek dosya imzası, boyut, ölçü ve tekrar kontrolünden geçer. Görseller için açıklayıcı alternatif metin zorunludur.
          </AdminHelperText>
        </details>
      </section>

      {message && (
        <p role="alert" className="rounded-control border border-cherie-error/30 bg-cherie-error/10 p-4 text-sm text-cherie-error">{message}</p>
      )}

      <section aria-labelledby="media-results-heading" className="space-y-5">
        <AdminSectionHeading
          id="media-results-heading"
          eyebrow="Kütüphane"
          title="Medya kayıtları"
          description="Magic-byte, MIME, boyut ve tekrar kontrolünden geçen dosyaların güncel operasyon görünümü."
          meta={<AdminMetadata>{count ?? 0} sonuç · en güncel 100 kayıt</AdminMetadata>}
        />

        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <AdminSegmentedControl
            label="Medya kayıt durumu"
            items={[
              { label: 'Aktif', href: '/admin/media', active: !archived, count: activeCount.count ?? 0 },
              { label: 'Arşiv', href: '/admin/media?state=archived', active: archived, count: archiveCount.count ?? 0 },
            ]}
          />
          <AdminToolbar label="Medya arama araçları">
            <form className="flex w-full gap-2 sm:min-w-[420px]" role="search">
              {archived && <input type="hidden" name="state" value="archived" />}
              <label className="flex min-h-11 flex-1 items-center gap-2 rounded-control border border-cherie-lace bg-white px-3 focus-within:border-cherie-brass focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cherie-focus">
                <Search className="size-4 shrink-0 text-cherie-soft-ink" aria-hidden="true" />
                <span className="sr-only">Medya ara</span>
                <input name="q" defaultValue={q} placeholder="Başlık veya alternatif metin ara" className="min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm" />
              </label>
              <button className="cherie-button-secondary min-h-11">Ara</button>
            </form>
          </AdminToolbar>
        </div>

        {error ? (
          <p role="alert" className="rounded-control border border-cherie-error/30 bg-cherie-error/10 p-4 text-sm text-cherie-error">Medya kayıtları okunamadı.</p>
        ) : rows.length === 0 ? (
          hasSearch ? (
            <AdminEmptyState
              title="Aramanızla eşleşen medya yok"
              description="Farklı bir başlık veya alternatif metin deneyin ya da aramayı temizleyerek tüm kayıtları görün."
              primary={{ label: 'Aramayı temizle', href: archived ? '/admin/media?state=archived' : '/admin/media' }}
              secondary={{ label: 'Yeni medya yükle', href: '#media-upload' }}
            />
          ) : archived ? (
            <AdminEmptyState
              title="Arşivlenmiş medya yok"
              description="Kullanımdan kaldırılan güvenli medya kayıtları burada görünür."
              primary={{ label: 'Aktif medyayı gör', href: '/admin/media' }}
            />
          ) : (
            <AdminEmptyState
              title="Henüz medya kaydı yok"
              description="Ürün, koleksiyon ve içeriklerde kullanacağınız görselleri güvenli biçimde yükleyebilirsiniz."
              primary={{ label: 'İlk dosyayı yükle', href: '#media-upload' }}
              secondary={{ label: 'Yükleme kurallarını gör', href: '#upload-rules' }}
            />
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {rows.map((asset) => (
              <article key={asset.id} className="overflow-hidden rounded-card-lg border border-cherie-lace bg-white/70 shadow-sm transition-shadow hover:shadow-card">
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-cherie-lace bg-cherie-paper">
                  {asset.type === 'image' && asset.url ? (
                    <Image src={asset.url} alt={asset.alt_text || ''} fill unoptimized sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  ) : (
                    <FileText className="size-12 text-cherie-brass" aria-hidden="true" />
                  )}
                  <span className="absolute left-3 top-3"><StateBadge value={asset.archived_at ? 'archived' : 'active'} /></span>
                </div>
                <div className="space-y-4 p-4">
                  <div>
                    <h3 className="line-clamp-2 text-base font-semibold leading-6 text-cherie-ink">{asset.title || asset.alt_text || 'Başlıksız medya'}</h3>
                    <p className={`mt-1 line-clamp-2 text-sm leading-5 ${asset.alt_text ? 'text-cherie-soft-ink' : 'font-semibold text-cherie-error'}`}>
                      {asset.alt_text || 'Alternatif metin eksik'}
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-cherie-lace py-3 text-sm">
                    <div><dt className="text-xs font-medium text-cherie-soft-ink">Tür</dt><dd className="mt-0.5 font-medium text-cherie-ink">{asset.mime_type ?? asset.type}</dd></div>
                    <div><dt className="text-xs font-medium text-cherie-soft-ink">Ölçü</dt><dd className="mt-0.5 font-medium text-cherie-ink">{asset.width && asset.height ? `${asset.width}×${asset.height}` : '—'}</dd></div>
                    <div><dt className="text-xs font-medium text-cherie-soft-ink">Boyut</dt><dd className="mt-0.5 font-medium text-cherie-ink">{asset.size_bytes ? `${(asset.size_bytes / 1024 / 1024).toFixed(2)} MB` : '—'}</dd></div>
                    <div><dt className="text-xs font-medium text-cherie-soft-ink">Kullanım</dt><dd className="mt-0.5 font-medium text-cherie-ink">{asset.usage}</dd></div>
                  </dl>
                  {asset.usageLabels.length > 0 && <AdminMetadata className="line-clamp-2">Kullanıldığı yer: {asset.usageLabels.join(', ')}</AdminMetadata>}
                  <div className="flex items-center justify-between gap-3">
                    <AdminMetadata><AdminDate value={asset.created_at} /></AdminMetadata>
                    <details className="relative">
                      <summary className="cursor-pointer rounded-control px-2 py-1 text-sm font-bold text-cherie-burgundy focus-visible:outline focus-visible:outline-2 focus-visible:outline-cherie-focus">Ayarlar</summary>
                      <div className="mt-3 border-t border-cherie-lace pt-3">
                        <form action={updateMediaMetadata} className="grid gap-2">
                          <input type="hidden" name="id" value={asset.id} />
                          <label className="grid gap-1 text-xs font-semibold text-cherie-ink">Başlık<input name="title" defaultValue={asset.title ?? ''} className="cherie-field" /></label>
                          <label className="grid gap-1 text-xs font-semibold text-cherie-ink">Alternatif metin<input name="alt_text" defaultValue={asset.alt_text ?? ''} className="cherie-field" /></label>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="grid gap-1 text-xs font-semibold text-cherie-ink">Yatay odak<input name="focal_x" type="number" min="0" max="1" step="0.01" defaultValue={asset.focal_x} className="cherie-field" /></label>
                            <label className="grid gap-1 text-xs font-semibold text-cherie-ink">Dikey odak<input name="focal_y" type="number" min="0" max="1" step="0.01" defaultValue={asset.focal_y} className="cherie-field" /></label>
                          </div>
                          <button className="cherie-button-secondary min-h-11">Kaydet</button>
                        </form>
                        {!asset.archived_at && (
                          <form action={archiveMedia} className="mt-2">
                            <input type="hidden" name="id" value={asset.id} />
                            <button disabled={asset.usage > 0} title={asset.usage > 0 ? 'Kullanımdaki medya arşivlenemez.' : ''} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control text-sm font-bold text-cherie-error hover:bg-cherie-error/10 disabled:cursor-not-allowed disabled:opacity-40">
                              <Archive className="size-4" aria-hidden="true" /> Güvenli arşivle
                            </button>
                          </form>
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!error && rows.length > 0 && <AdminMetadata>Toplam {count ?? 0} kayıt · Bu görünüm en güncel 100 kaydı gösterir.</AdminMetadata>}
      </section>
    </div>
  );
}
