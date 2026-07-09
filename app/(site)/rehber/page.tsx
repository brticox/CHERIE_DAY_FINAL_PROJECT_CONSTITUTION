import type { Metadata } from 'next';

import { getArticles } from '@/lib/data/editorial';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ArticleCard } from '@/components/content/article-card';

export const metadata: Metadata = buildMetadata({
  title: 'Rehber — Kutlama İlhamı | CHERIE DAY',
  description:
    'Evde söz fikirlerinden düğün bütçesine; kutlamalarınız için sakin, uygulanabilir rehberler.',
  path: ROUTES.rehber,
});

export default async function RehberPage() {
  const articles = await getArticles();
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Rehber', path: ROUTES.rehber }]} />
      <PageHeader
        eyebrow="Editoryal"
        title="Kutlamanız için sakin bir kılavuz"
        lead="Sorularınıza doğrudan yanıtlar; ilhamı ve pratiği bir arada tutan yazılar."
      />
      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
