import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getArticles, getArticleBySlug } from '@/lib/data/editorial';
import { buildMetadata, articleLd } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { JsonLd } from '@/components/layout/json-ld';

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ 'article-slug': a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ 'article-slug': string }>;
}): Promise<Metadata> {
  const { 'article-slug': slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return buildMetadata({
    title: `${article.title} | CHERIE DAY Rehber`,
    description: article.excerpt ?? article.title,
    path: `${ROUTES.rehber}/${slug}`,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ 'article-slug': string }>;
}) {
  const { 'article-slug': slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const path = `${ROUTES.rehber}/${slug}`;

  return (
    <article className="cherie-container max-w-3xl py-14">
      <JsonLd data={articleLd(article, path)} />
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Rehber', path: ROUTES.rehber },
          { name: article.title, path },
        ]}
      />
      <p className="text-xs uppercase tracking-wider text-cherie-brass">
        {article.category ?? 'Rehber'}
      </p>
      <h1 className="mt-2 text-h1 text-cherie-ink">{article.title}</h1>
      <p className="mt-3 text-sm text-cherie-soft-ink">{article.author_display}</p>

      <div className="mt-8 space-y-4 text-body-lg leading-relaxed text-cherie-soft-ink">
        {(article.body_tr ?? article.excerpt ?? '').split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  );
}
