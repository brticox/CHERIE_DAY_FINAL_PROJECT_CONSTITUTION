import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publishPage, rollbackPage, savePage } from '../actions';
import { requireCapability } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDate, StateBadge } from '@/components/admin/resource-list';
type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {};
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const bool = (v: unknown) => v === true;
const ids = (v: unknown) =>
  Array.isArray(v) ? (v.filter((x) => typeof x === 'string') as string[]) : [];
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const state = await searchParams;
  const { staff } = await requireCapability('content.read', `/admin/cms/pages/${id}`);
  const db = createAdminClient();
  const [pageQ, productsQ, collectionsQ, servicesQ, citiesQ, mediaQ, revisionsQ] =
    await Promise.all([
      db.from('pages').select('*').eq('id', id).single(),
      db.from('products').select('id,name').is('archived_at', null).order('name'),
      db.from('collections').select('id,name').order('name'),
      db.from('service_packages').select('id,name').order('name'),
      db.from('service_cities').select('id,city_name').order('city_name'),
      db
        .from('media_assets')
        .select('id,title,alt_text')
        .is('archived_at', null)
        .eq('type', 'image')
        .limit(200),
      db
        .from('content_revisions')
        .select('id,version,action,created_at')
        .eq('entity_type', 'page')
        .eq('entity_id', id)
        .order('version', { ascending: false })
        .limit(20),
    ]);
  const data = pageQ.data;
  if (!data) notFound();
  const body = obj(data.body),
    hero = obj(body.hero),
    primary = obj(hero.primaryCta),
    secondary = obj(hero.secondaryCta),
    featured = obj(body.featured),
    testimonials = obj(body.testimonials),
    faq = obj(body.faq),
    coverage = obj(body.coverage),
    footer = obj(body.footer),
    navigation = obj(body.navigation),
    social = obj(body.social);
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <header>
        <Link href="/admin/cms/pages" className="text-sm text-cherie-burgundy">
          ← Sayfalara dön
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-cherie-brass">
              Yapılandırılmış CMS
            </p>
            <h1 className="font-display text-4xl">{data.title}</h1>
          </div>
          <StateBadge value={data.status} />
        </div>
      </header>
      {state.saved && (
        <p
          role="status"
          className="rounded-control bg-cherie-success/10 p-4 text-sm text-cherie-success"
        >
          Sayfa kaydedildi.
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
      <form action={savePage} className="space-y-6">
        <input type="hidden" name="id" value={id} />
        <Section title="Sayfa kimliği">
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="title" label="Başlık" value={data.title} maxLength={160} />
            <Field name="slug" label="Slug" value={data.slug} maxLength={160} />
          </div>
        </Section>
        <Section title="Hero" toggle="hero_visible" checked={bool(hero.visible)}>
          <Field
            name="hero_eyebrow"
            label="Üst başlık (≤100)"
            value={str(hero.eyebrow)}
          />
          <Field
            name="hero_heading"
            label="Ana başlık (≤160)"
            value={str(hero.heading)}
          />
          <Area name="hero_copy" label="Açıklama (≤600)" value={str(hero.copy)} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              name="primary_cta_label"
              label="Birincil CTA"
              value={str(primary.label)}
            />
            <Field
              name="primary_cta_href"
              label="Birincil bağlantı"
              value={str(primary.href)}
            />
            <Field
              name="secondary_cta_label"
              label="İkincil CTA"
              value={str(secondary.label)}
            />
            <Field
              name="secondary_cta_href"
              label="İkincil bağlantı"
              value={str(secondary.href)}
            />
          </div>
          <Picker
            name="hero_media_id"
            label="Hero medyası"
            value={str(hero.mediaId)}
            rows={(mediaQ.data ?? []).map((x) => ({
              id: x.id,
              label: x.title || x.alt_text || 'Başlıksız medya',
            }))}
          />
        </Section>
        <Section title="Öne çıkan bağlı içerik">
          <Multi
            name="featured_products"
            label="Ürünler"
            selected={ids(featured.products)}
            rows={(productsQ.data ?? []).map((x) => ({ id: x.id, label: x.name }))}
          />
          <Multi
            name="featured_collections"
            label="Koleksiyonlar"
            selected={ids(featured.collections)}
            rows={(collectionsQ.data ?? []).map((x) => ({ id: x.id, label: x.name }))}
          />
          <Multi
            name="featured_services"
            label="Hizmetler"
            selected={ids(featured.services)}
            rows={(servicesQ.data ?? []).map((x) => ({ id: x.id, label: x.name }))}
          />
        </Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Section
            title="Müşteri yorumları"
            toggle="testimonials_visible"
            checked={bool(testimonials.visible)}
          >
            <Field
              name="testimonials_heading"
              label="Bölüm başlığı"
              value={str(testimonials.heading)}
            />
          </Section>
          <Section
            title="SSS önizlemesi"
            toggle="faq_visible"
            checked={bool(faq.visible)}
          >
            <Field name="faq_heading" label="Bölüm başlığı" value={str(faq.heading)} />
          </Section>
        </div>
        <Section
          title="Şehir kapsamı"
          toggle="coverage_visible"
          checked={bool(coverage.visible)}
        >
          <Field name="coverage_heading" label="Başlık" value={str(coverage.heading)} />
          <Area name="coverage_copy" label="Açıklama" value={str(coverage.copy)} />
          <Multi
            name="coverage_cities"
            label="Şehirler"
            selected={ids(coverage.cities)}
            rows={(citiesQ.data ?? []).map((x) => ({ id: x.id, label: x.city_name }))}
          />
        </Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Footer">
            <Field name="footer_heading" label="Başlık" value={str(footer.heading)} />
            <Area name="footer_copy" label="Metin" value={str(footer.copy)} />
          </Section>
          <Section title="Navigasyon ve sosyal">
            <Field
              name="nav_cta_label"
              label="Navigasyon CTA"
              value={str(navigation.ctaLabel)}
            />
            <Field
              name="nav_cta_href"
              label="CTA bağlantısı"
              value={str(navigation.ctaHref)}
            />
            <Field name="instagram" label="Instagram" value={str(social.instagram)} />
            <Field name="pinterest" label="Pinterest" value={str(social.pinterest)} />
            <Field name="youtube" label="YouTube" value={str(social.youtube)} />
          </Section>
        </div>
        <details className="rounded-card-lg border border-cherie-lace p-5">
          <summary className="cursor-pointer font-bold">Gelişmiş JSON fallback</summary>
          <p className="my-2 text-xs text-cherie-soft-ink">
            Yalnızca yapılandırılmış alanların kapsamadığı ek anahtarlar için.
          </p>
          <textarea
            aria-label="Gelişmiş JSON içeriği"
            name="advanced_json"
            rows={10}
            defaultValue={JSON.stringify(body, null, 2)}
            className="cherie-field font-mono text-xs"
          />
        </details>
        <div className="flex flex-wrap gap-3">
          <button className="cherie-button-primary">Taslağı kaydet</button>
          {can(staff.role, 'content.publish') && (
            <button formAction={publishPage} className="cherie-button-secondary">
              Mevcut taslağı yayınla
            </button>
          )}
        </div>
      </form>
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-card-lg border border-cherie-lace p-5">
          <h2 className="font-display text-2xl">Önizleme</h2>
          <p className="mt-1 text-xs text-cherie-soft-ink">Bu önizleme yayın yapmaz.</p>
          <div className="mt-4 rounded-card-lg bg-cherie-burgundy p-7 text-white">
            <p className="text-xs uppercase tracking-widest">{str(hero.eyebrow)}</p>
            <h3 className="mt-2 font-display text-4xl">
              {str(hero.heading) || data.title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm text-white/80">{str(hero.copy)}</p>
          </div>
        </div>
        <div className="rounded-card-lg border border-cherie-lace p-5">
          <h2 className="font-display text-2xl">Sürüm geçmişi</h2>
          <ol className="mt-4 space-y-3">
            {(revisionsQ.data ?? []).map((revision) => (
              <li
                key={revision.id}
                className="flex items-center justify-between gap-3 border-l-2 border-cherie-lace pl-3 text-sm"
              >
                <span>
                  <strong>
                    v{revision.version} · {revision.action}
                  </strong>
                  <small className="block text-cherie-soft-ink">
                    <AdminDate value={revision.created_at} />
                  </small>
                </span>
                <form action={rollbackPage}>
                  <input type="hidden" name="id" value={id} />
                  <button
                    name="revision_id"
                    value={revision.id}
                    className="font-bold text-cherie-burgundy"
                  >
                    Geri al
                  </button>
                </form>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
function Section({
  title,
  toggle,
  checked,
  children,
}: {
  title: string;
  toggle?: string;
  checked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-card-lg border border-cherie-lace bg-white/60 p-5 md:p-7">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">{title}</h2>
        {toggle && (
          <label className="text-sm font-bold">
            <input
              type="checkbox"
              name={toggle}
              defaultChecked={checked}
              className="mr-2"
            />
            Görünür
          </label>
        )}
      </div>
      {children}
    </section>
  );
}
function Field({
  name,
  label,
  value,
  ...props
}: {
  name: string;
  label: string;
  value: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input name={name} defaultValue={value} className="cherie-field" {...props} />
    </label>
  );
}
function Area({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <textarea name={name} defaultValue={value} rows={4} className="cherie-field" />
    </label>
  );
}
function Picker({
  name,
  label,
  value,
  rows,
}: {
  name: string;
  label: string;
  value: string;
  rows: { id: string; label: string }[];
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select name={name} defaultValue={value} className="cherie-field">
        <option value="">Seçilmedi</option>
        {rows.map((x) => (
          <option key={x.id} value={x.id}>
            {x.label}
          </option>
        ))}
      </select>
    </label>
  );
}
function Multi({
  name,
  label,
  rows,
  selected,
}: {
  name: string;
  label: string;
  rows: { id: string; label: string }[];
  selected: string[];
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">{label}</legend>
      <div className="mt-2 flex max-h-44 flex-wrap gap-2 overflow-auto">
        {rows.map((x) => (
          <label
            key={x.id}
            className="rounded-full border border-cherie-lace px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              name={name}
              value={x.id}
              defaultChecked={selected.includes(x.id)}
              className="mr-2"
            />
            {x.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
