import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { getCollections } from '@/lib/data/catalog';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';

export const metadata: Metadata = buildMetadata({
  title: 'Dünyalar — CHERIE DAY Koleksiyon Evreni',
  description:
    'Cherry Seal’den Ivory Letter’a; CHERIE DAY koleksiyonları birer dünya gibi kurulur. Her dünyanın kendi rengi, kendi hikâyesi ve kendi ürünleri var.',
  path: ROUTES.maisonDunyalar,
});

export default async function DunyalarPage() {
  const collections = await getCollections();

  return (
    <div className="cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Maison', path: ROUTES.maison },
          { name: 'Dünyalar', path: ROUTES.maisonDunyalar },
        ]}
      />
      <PageHeader
        eyebrow="Koleksiyon Evreni"
        title="Her koleksiyon, girilecek bir dünya gibi kurulur"
        lead="Bir renk paleti, bir doku, bir his. CHERIE DAY dünyaları davetiyeden hediyeliğe kadar tek bir tonda konuşur — hangisi sizin gününüze benziyor?"
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`${ROUTES.koleksiyonlar}/${collection.slug}`}
            className="group flex flex-col overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-ivory transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
          >
            {/* Palette band as the world's "sky" */}
            <div
              className="relative h-40 w-full"
              style={{
                background:
                  collection.palette.length > 0
                    ? `linear-gradient(135deg, ${collection.palette.join(', ')})`
                    : 'linear-gradient(135deg, var(--cherie-paper), var(--cherie-mist))',
              }}
              aria-hidden
            >
              <span className="absolute bottom-3 left-4 flex gap-1.5">
                {collection.palette.map((hex) => (
                  <span
                    key={hex}
                    className="size-4 rounded-full border border-cherie-ivory/70 shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-cherie-ink group-hover:text-cherie-burgundy">
                  {collection.name}
                </h2>
                {collection.is_featured && (
                  <span className="text-[10px] uppercase tracking-[0.16em] text-cherie-brass">
                    Öne çıkan
                  </span>
                )}
              </div>
              {collection.story && (
                <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
                  {collection.story}
                </p>
              )}
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cherie-burgundy">
                Bu dünyaya gir
                <ArrowUpRight className="size-4 transition-transform duration-control ease-cherie group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-sm text-cherie-soft-ink">
        Tüm koleksiyonları ürünleriyle birlikte{' '}
        <Link href={ROUTES.koleksiyonlar} className="text-cherie-burgundy hover:underline">
          Koleksiyonlar
        </Link>{' '}
        sayfasında görebilir, doğrudan{' '}
        <Link href={ROUTES.magaza} className="text-cherie-burgundy hover:underline">
          Mağaza
        </Link>
        ’dan alışverişe başlayabilirsiniz.
      </p>
    </div>
  );
}
