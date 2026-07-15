import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, Star } from 'lucide-react';

import { getCollections, getDepartments, getProducts } from '@/lib/data/catalog';
import { getExperiences } from '@/lib/data/editorial';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { DepartmentGrid } from '@/components/commerce/department-grid';
import { ProductGrid } from '@/components/commerce/product-grid';

export const metadata: Metadata = buildMetadata({
  title: 'Mağaza — Davetiyeden Hediyeye',
  description:
    'Davetiye, dijital davetiye, hediyelik, nişan & söz ürünleri ve daha fazlası. CHERIE DAY Ürün Evi’ni keşfedin.',
  path: ROUTES.magaza,
});

const OCCASION_SHORTCUTS = [
  { slug: 'dugun', label: 'Düğün' },
  { slug: 'nisan-soz', label: 'Nişan & Söz' },
  { slug: 'nikah', label: 'Nikah' },
  { slug: 'dogum-gunu', label: 'Doğum Günü' },
  { slug: 'baby-shower', label: 'Baby Shower' },
];

export default async function MagazaPage() {
  const [departments, featured, collections, experiences] = await Promise.all([
    getDepartments(),
    getProducts({ limit: 8 }),
    getCollections(),
    getExperiences(),
  ]);

  const occasionSlugs = new Set(experiences.map((e) => e.slug));
  const occasions = OCCASION_SHORTCUTS.filter((o) => occasionSlugs.has(o.slug));
  const featuredCollections = collections.filter((c) => c.is_featured).slice(0, 4);

  return (
    <div className="cherie-page-glow cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Mağaza', path: ROUTES.magaza },
        ]}
      />
      <PageHeader
        eyebrow="Ürün Evi"
        title="Her kapı, ayrı bir hikâyeye açılır"
        lead="Kağıda dökülen ilk sözden, misafirinize kalan hatıraya kadar; departmanlarımızda gezinin."
      />

      {/* Discovery shortcuts */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href={`${ROUTES.magaza}/one-cikanlar`}
          className="group flex items-center gap-4 rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-cherie-lace bg-cherie-paper/60 text-cherie-brass">
            <Star className="size-5" strokeWidth={1.6} />
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg text-cherie-ink group-hover:text-cherie-burgundy">
              Öne Çıkanlar
            </span>
            <span className="mt-0.5 block text-sm text-cherie-soft-ink">
              Bu dönem en çok sevilen seçki
            </span>
          </span>
          <ArrowUpRight className="size-5 text-cherie-brass transition-transform duration-control ease-cherie group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <Link
          href={`${ROUTES.magaza}/yeni`}
          className="group flex items-center gap-4 rounded-card-lg border border-cherie-lace bg-cherie-ivory p-5 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-cherie-lace bg-cherie-paper/60 text-cherie-brass">
            <Sparkles className="size-5" strokeWidth={1.6} />
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg text-cherie-ink group-hover:text-cherie-burgundy">
              Yeni Sezon
            </span>
            <span className="mt-0.5 block text-sm text-cherie-soft-ink">
              Her departmandan keşfedilecekler
            </span>
          </span>
          <ArrowUpRight className="size-5 text-cherie-brass transition-transform duration-control ease-cherie group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </section>

      {/* Occasion shortcuts */}
      {occasions.length > 0 && (
        <section className="mt-8">
          <p className="text-sm text-cherie-soft-ink">Kutlamaya göre keşfedin</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {occasions.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`${ROUTES.magaza}/etkinlik/${o.slug}`}
                  className="inline-flex items-center rounded-full border border-cherie-lace bg-cherie-ivory px-4 py-1.5 text-sm text-cherie-soft-ink transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-burgundy"
                >
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Departments */}
      <section className="mt-14">
        <DepartmentGrid departments={departments} />
      </section>

      {/* Featured collections */}
      {featuredCollections.length > 0 && (
        <section className="mt-20">
          <p className="cherie-kicker">Koleksiyon dünyaları</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {featuredCollections.map((c) => (
              <Link
                key={c.id}
                href={`${ROUTES.magaza}/koleksiyon/${c.slug}`}
                className="inline-flex items-center rounded-full border border-cherie-lace bg-cherie-ivory px-4 py-1.5 text-sm text-cherie-soft-ink transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-burgundy"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mt-16 border-t border-cherie-lace pt-16">
        <p className="cherie-kicker">Maison seçkisi</p>
        <h2 className="text-h2 mt-3 text-cherie-ink">Öne Çıkan Seçimler</h2>
        <div className="mt-8">
          <ProductGrid products={featured} />
        </div>
      </section>
    </div>
  );
}
