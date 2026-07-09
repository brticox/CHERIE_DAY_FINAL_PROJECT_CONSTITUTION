import Link from 'next/link';

import type { SearchResult } from '@/lib/data/types';
import { SEARCH_TYPE_LABELS } from '@/lib/data/search';
import { Badge } from '@/components/ui/badge';

export function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <Link
      href={result.href}
      className="group flex items-start justify-between gap-4 rounded-card border border-cherie-lace bg-cherie-ivory p-5 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
    >
      <div>
        <h3 className="font-medium text-cherie-ink group-hover:text-cherie-burgundy">
          {result.title}
        </h3>
        {result.excerpt && (
          <p className="mt-1 text-sm text-cherie-soft-ink">{result.excerpt}</p>
        )}
      </div>
      <Badge tone="muted">{SEARCH_TYPE_LABELS[result.type]}</Badge>
    </Link>
  );
}
