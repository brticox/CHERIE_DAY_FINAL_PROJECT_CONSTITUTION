import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import type { Collection } from '@/lib/data/types';

/** Grid of collection worlds with palette swatches (docs/13 collection SEO). */
export function CollectionGrid({ collections }: { collections: Collection[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((c) => (
        <Link
          key={c.id}
          href={`${ROUTES.koleksiyonlar}/${c.slug}`}
          className="group overflow-hidden rounded-card border border-cherie-lace bg-cherie-ivory transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
        >
          <div className="flex h-28 w-full">
            {(c.palette.length ? c.palette : ['#F3EDE3', '#E8D8C7', '#B08A57']).map((hex, i) => (
              <span key={i} className="flex-1" style={{ backgroundColor: hex }} aria-hidden />
            ))}
          </div>
          <div className="p-5">
            <h3 className="font-display text-2xl text-cherie-ink group-hover:text-cherie-burgundy">
              {c.name}
            </h3>
            {c.story && <p className="mt-1 text-sm text-cherie-soft-ink">{c.story}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
