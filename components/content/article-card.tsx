import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import type { Article } from '@/lib/data/types';
import { MediaFrame } from '@/components/commerce/media-frame';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`${ROUTES.rehber}/${article.slug}`} className="group block">
      <MediaFrame label={article.title} ratio="aspect-[16/10]" />
      <p className="mt-3 text-xs uppercase tracking-wider text-cherie-brass">
        {article.category ?? 'Rehber'}
      </p>
      <h3 className="mt-1 font-display text-xl text-cherie-ink group-hover:text-cherie-burgundy">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="mt-1 text-sm text-cherie-soft-ink">{article.excerpt}</p>
      )}
    </Link>
  );
}
