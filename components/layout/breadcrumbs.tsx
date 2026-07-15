import Link from 'next/link';

import { JsonLd } from './json-ld';
import { breadcrumbLd } from '@/lib/data/seo';

export type Crumb = { name: string; path: string };

/** Breadcrumb trail + BreadcrumbList schema (docs/40 §5, docs/13). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Sayfa yolu" className="mb-6">
      <JsonLd data={breadcrumbLd(items)} />
      <ol className="flex flex-wrap items-center gap-2 text-xs text-cherie-soft-ink">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-cherie-ink">{item.name}</span>
              ) : (
                <Link
                  href={item.path}
                  className="inline-flex min-h-11 min-w-11 items-center hover:text-cherie-burgundy"
                >
                  {item.name}
                </Link>
              )}
              {!isLast && <span aria-hidden>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
