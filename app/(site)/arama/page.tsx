import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';

import { search, type SearchFilter } from '@/lib/data/search';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { SearchResultCard } from '@/components/content/search-result-card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildMetadata({
  title: 'Arama | CHERIE DAY',
  description: 'Davetiye, hediye, nişan ve hizmetlerimizde arama yapın.',
  path: ROUTES.arama,
  noindex: true, // thin search results excluded from index (docs/13)
});

const TUR_MAP: Record<string, SearchFilter> = {
  urun: 'product',
  hizmet: 'service_package',
  koleksiyon: 'collection',
  rehber: 'article',
};

export default async function AramaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tur?: string }>;
}) {
  const { q = '', tur } = await searchParams;
  const filter: SearchFilter = (tur && TUR_MAP[tur]) || 'all';
  const query = q.trim();
  const results = query.length >= 2 ? await search(query, filter) : [];

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Arama', path: ROUTES.arama }]} />
      <PageHeader eyebrow="Arama" title="Ne arıyorsunuz?" />

      <form action={ROUTES.arama} method="get" className="mt-8 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cherie-brass" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Davetiye, hediye, nişan… ne arıyorsunuz?"
            aria-label="Arama"
            className="h-11 w-full rounded-control border border-cherie-lace bg-cherie-ivory pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
        </div>
        <Button type="submit">Ara</Button>
      </form>

      <div className="mt-10">
        {query.length < 2 ? (
          <div>
            <p className="text-sm text-cherie-soft-ink">Popüler aramalar</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['davetiye', 'nişan tepsisi', 'nikah şekeri', 'dijital davetiye', 'organizasyon'].map((term) => (
                <Link
                  key={term}
                  href={`${ROUTES.arama}?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-cherie-lace px-4 py-1.5 text-sm text-cherie-soft-ink hover:border-cherie-burgundy hover:text-cherie-burgundy"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-card border border-dashed border-cherie-lace bg-cherie-paper/50 p-8 text-center">
            <p className="font-display text-xl text-cherie-ink">
              “{query}” için sonuç bulamadık
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-cherie-soft-ink">
              Aradığınızı bulamadık, ama sizin için bulmaya hazırız. Yazımı kontrol edebilir veya
              kategorilere göz atabilirsiniz.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="secondary"><Link href={ROUTES.magaza}>Mağaza</Link></Button>
              <Button asChild variant="secondary"><Link href={ROUTES.koleksiyonlar}>Koleksiyonlar</Link></Button>
              <Button asChild variant="ghost"><Link href={ROUTES.iletisim}>Bize Danışın</Link></Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-cherie-soft-ink">{results.length} sonuç bulundu</p>
            <div className="mt-4 grid gap-3">
              {results.map((r) => (
                <SearchResultCard key={`${r.type}-${r.id}`} result={r} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
