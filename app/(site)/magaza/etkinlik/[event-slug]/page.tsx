import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getExperiences, getExperienceBySlug } from '@/lib/data/editorial';
import { getProducts } from '@/lib/data/catalog';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ProductGrid } from '@/components/commerce/product-grid';
import { EmptyState } from '@/components/layout/states';
import { Button } from '@/components/ui/button';

/**
 * Which product departments each occasion draws from. Curated and explainable
 * (docs Phase 4F: recommendations must be reasoned, never random). When a live
 * occasion→product mapping exists in the DB this can be replaced transparently.
 */
const OCCASION_DEPARTMENTS: Record<string, string[]> = {
  dugun: ['davetiye', 'hediyelik', 'masa-kartlari', 'menu', 'karsilama-panosu', 'mum', 'gelin-hazirligi', 'setler', 'hatira-album'],
  'nisan-soz': ['nisan-soz', 'nisan-tepsisi', 'davetiye', 'hediyelik', 'muhur-kurdele', 'kutu-paketleme', 'yuzukler'],
  isteme: ['nisan-soz', 'hediyelik', 'kutu-paketleme', 'muhur-kurdele', 'mum'],
  kina: ['davetiye', 'hediyelik', 'mum', 'karsilama-panosu', 'muhur-kurdele'],
  nikah: ['davetiye', 'hediyelik', 'masa-kartlari', 'menu', 'karsilama-panosu'],
  'dogum-gunu': ['davetiye', 'hediyelik', 'kutu-paketleme', 'mum', 'karsilama-panosu'],
  'baby-shower': ['davetiye', 'hediyelik', 'kutu-paketleme', 'mum'],
  'gender-reveal': ['davetiye', 'hediyelik', 'kutu-paketleme'],
  kurumsal: ['davetiye', 'masa-kartlari', 'menu', 'hediyelik', 'karsilama-panosu'],
  'ozel-davetler': ['davetiye', 'hediyelik', 'mum', 'kutu-paketleme'],
};

// Render products/collections created after the last build on-demand (then ISR-cache),
// so a newly published or renamed item resolves without a redeploy.
export const dynamicParams = true;

export async function generateStaticParams() {
  const experiences = await getExperiences();
  return experiences.map((e) => ({ 'event-slug': e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ 'event-slug': string }>;
}): Promise<Metadata> {
  const { 'event-slug': slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) return { title: 'Etkinlik Bulunamadı' };
  return buildMetadata({
    title: `${exp.name} için Ürünler | CHERIE DAY Mağaza`,
    description:
      exp.summary ??
      `${exp.name} için davetiye, hediyelik ve tören detaylarını bir arada keşfedin.`,
    path: `${ROUTES.magaza}/etkinlik/${slug}`,
  });
}

export default async function OccasionShopPage({
  params,
}: {
  params: Promise<{ 'event-slug': string }>;
}) {
  const { 'event-slug': slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) notFound();

  const departments = OCCASION_DEPARTMENTS[slug] ?? [];
  const deptSet = new Set(departments);
  const all = await getProducts();
  const products = all.filter((p) => deptSet.has(p.department_slug));

  return (
    <div className="cherie-page-glow cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Mağaza', path: ROUTES.magaza },
          { name: `${exp.name} için`, path: `${ROUTES.magaza}/etkinlik/${slug}` },
        ]}
      />
      <PageHeader
        eyebrow="Etkinliğe Göre"
        title={`${exp.name} için özenle seçtiklerimiz`}
        lead={
          exp.summary ??
          `${exp.name} gününüze yakışan davetiye, hediyelik ve tören detaylarını bir araya getirdik.`
        }
      />

      {products.length > 0 ? (
        <>
          <p className="mt-8 text-sm text-cherie-soft-ink">
            {products.length} ürün · bu kutlama için ilgili departmanlardan
            derlendi
          </p>
          <div className="mt-8">
            <ProductGrid products={products} />
          </div>
        </>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="Bu kutlama için seçki hazırlanıyor"
            description="Şimdilik tüm mağazayı gezebilir ya da bize hayalinizdeki günü anlatabilirsiniz."
            ctaLabel="Mağazaya Dön"
            ctaHref={ROUTES.magaza}
          />
        </div>
      )}

      <section className="mt-16 flex flex-wrap gap-3 border-t border-cherie-lace pt-10">
        <Button asChild size="lg" variant="secondary">
          <Link href={`${ROUTES.deneyimler}/${slug}`}>{exp.name} Deneyimini İncele</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href={`${ROUTES.planlama}/hayalini-tasarla`}>Hayalini Tasarla</Link>
        </Button>
      </section>
    </div>
  );
}
