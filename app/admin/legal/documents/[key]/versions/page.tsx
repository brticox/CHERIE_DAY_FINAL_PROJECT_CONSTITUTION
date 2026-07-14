import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
import { requireCapability } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  approveLegalDraft,
  archiveLegalDraft,
  createLegalDraft,
  publishLegalDraft,
} from './actions';
export const dynamic = 'force-dynamic';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { key } = await params;
  const state = await searchParams;
  const { staff } = await requireCapability(
    'legal.read',
    `/admin/legal/documents/${key}/versions`,
  );
  const db = createAdminClient();
  const { data: document } = await db
    .from('legal_documents')
    .select('*')
    .eq('doc_key', key as never)
    .single();
  if (!document) notFound();
  const [{ data: versions, error }, { data: consents }] = await Promise.all([
    db
      .from('legal_document_versions')
      .select('*')
      .eq('legal_document_id', document.id)
      .order('created_at', { ascending: false }),
    db
      .from('consent_records')
      .select('legal_document_version_id')
      .not('legal_document_version_id', 'is', null),
  ]);
  const usage = new Map<string, number>();
  for (const row of consents ?? [])
    if (row.legal_document_version_id)
      usage.set(
        row.legal_document_version_id,
        (usage.get(row.legal_document_version_id) ?? 0) + 1,
      );
  const comparable = (versions ?? []).slice(0, 2);
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <header>
        <Link href="/admin/legal/documents" className="text-sm text-cherie-burgundy">
          ← Yasal belgelere dön
        </Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">
          Değiştirilemez yayın geçmişi
        </p>
        <h1 className="font-display text-4xl">{document.title_tr}</h1>
        <p className="mt-2 text-sm text-cherie-soft-ink">
          Yayınlanmış, supersede edilmiş veya sipariş/onay kayıtlarında kullanılan
          sürümler değiştirilemez ve silinemez.
        </p>
      </header>
      {state.saved && (
        <p
          role="status"
          className="rounded-control bg-cherie-success/10 p-4 text-sm text-cherie-success"
        >
          Yasal sürüm işlemi tamamlandı.
        </p>
      )}
      {state.error && (
        <p
          role="alert"
          className="rounded-control bg-cherie-error/10 p-4 text-sm text-cherie-error"
        >
          {decodeURIComponent(state.error)}
        </p>
      )}
      {can(staff.role, 'legal.publish') && (
        <details className="rounded-card-lg border border-cherie-lace bg-white/60 p-5">
          <summary className="cursor-pointer font-display text-2xl">
            Onaylı içerikten taslak oluştur
          </summary>
          <form action={createLegalDraft} className="mt-5 grid gap-4">
            <input type="hidden" name="key" value={key} />
            <input type="hidden" name="document_id" value={document.id} />
            <label className="grid gap-2 text-sm font-bold">
              Sürüm
              <input
                name="version"
                required
                placeholder="2026.07"
                className="cherie-field"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Özet
              <input name="summary" required maxLength={500} className="cherie-field" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Onaylı içerik veya JSON
              <textarea
                name="content"
                required
                rows={14}
                className="cherie-field font-mono text-xs"
              />
              <span className="text-xs font-normal text-cherie-soft-ink">
                İçe aktarma JSON sözdizimini doğrular ve SHA-256 içerik özeti kaydeder.
                Yeni taslak varsayılan olarak hukuk incelemesi bekler.
              </span>
            </label>
            <button className="cherie-button-primary">
              Taslağı doğrula ve içe aktar
            </button>
          </form>
        </details>
      )}
      {comparable.length === 2 && (
        <details className="rounded-card-lg border border-cherie-lace p-5">
          <summary className="cursor-pointer font-display text-2xl">
            Son iki sürümü karşılaştır
          </summary>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {comparable.map((v) => (
              <div key={v.id}>
                <h3 className="font-bold">Sürüm {v.version}</h3>
                <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-control bg-cherie-paper p-4 text-xs">
                  {JSON.stringify(v.body, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </details>
      )}
      <div className="space-y-3">
        {versions?.map((v) => (
          <article
            key={v.id}
            className="grid gap-4 rounded-card-lg border border-cherie-lace bg-white/60 p-5 lg:grid-cols-[1fr_auto]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl">Sürüm {v.version}</h2>
                <StateBadge value={v.lifecycle_state} />
                {v.is_current && <StateBadge value="current" />}
              </div>
              <p className="mt-2 text-sm text-cherie-soft-ink">
                {v.summary || 'Sürüm özeti girilmemiş.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-cherie-soft-ink">
                <span>
                  Oluşturma: <AdminDate value={v.created_at} />
                </span>
                <span>
                  Yayın: <AdminDate value={v.published_at} />
                </span>
                <span>Onay: {v.approval_status}</span>
                <span>Kullanım: {usage.get(v.id) ?? 0}</span>
                <span>İçerik özeti: {v.content_hash?.slice(0, 12) ?? '—'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div
                className={`rounded-control p-3 text-xs ${v.needs_lawyer_review ? 'bg-cherie-warning/10 text-cherie-warning' : 'bg-cherie-success/10 text-cherie-success'}`}
              >
                {v.needs_lawyer_review
                  ? 'Hukuk onayı bekliyor'
                  : 'Hukuk kontrolü tamamlandı'}
              </div>
              {can(staff.role, 'legal.publish') &&
                ['draft', 'awaiting_review'].includes(v.lifecycle_state) && (
                  <form action={approveLegalDraft} className="grid gap-2">
                    <input type="hidden" name="key" value={key} />
                    <input type="hidden" name="id" value={v.id} />
                    <input
                      name="reviewer"
                      required
                      placeholder="Hukuk inceleyen"
                      className="cherie-field"
                    />
                    <input
                      name="reference"
                      required
                      placeholder="Onay referansı"
                      className="cherie-field"
                    />
                    <button className="cherie-button-secondary">Onayı kaydet</button>
                  </form>
                )}
              {can(staff.role, 'legal.publish') && v.lifecycle_state === 'approved' && (
                <form action={publishLegalDraft}>
                  <input type="hidden" name="key" value={key} />
                  <input type="hidden" name="id" value={v.id} />
                  <button className="cherie-button-primary w-full">Atomik yayınla</button>
                </form>
              )}
              {can(staff.role, 'legal.publish') &&
                ['draft', 'awaiting_review', 'approved'].includes(v.lifecycle_state) && (
                  <form action={archiveLegalDraft}>
                    <input type="hidden" name="key" value={key} />
                    <input type="hidden" name="id" value={v.id} />
                    <button className="w-full text-sm font-bold text-cherie-error">
                      Taslağı arşivle
                    </button>
                  </form>
                )}
            </div>
          </article>
        ))}
        {!versions?.length && (
          <div className="rounded-card-lg border border-dashed border-cherie-lace p-10 text-center">
            Henüz sürüm yok. Onaylı içerik teslimi bekleniyor.
          </div>
        )}
      </div>
      {error && <p role="alert">Sürüm geçmişi okunamadı.</p>}
    </div>
  );
}
