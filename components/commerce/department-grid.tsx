import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import type { Department } from '@/lib/data/types';
import { MediaFrame } from './media-frame';
import { ArrowUpRight } from 'lucide-react';

/** Grid of shop departments (docs/40 §3.3). */
export function DepartmentGrid({ departments }: { departments: Department[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {departments.map((d) => (
        <Link
          key={d.id}
          href={`${ROUTES.magaza}/${d.slug}`}
          className="group overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-ivory p-3 transition duration-card ease-cherie hover:-translate-y-1 hover:border-cherie-brass hover:shadow-lift"
        >
          <MediaFrame label={d.name_tr} ratio="aspect-[16/10]" className="border-0" />
          <div className="flex items-start justify-between gap-4 px-2 pb-3 pt-5">
            <div>
              <h3 className="text-h3 text-cherie-ink transition-colors group-hover:text-cherie-burgundy">
                {d.name_tr}
              </h3>
              {d.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-cherie-soft-ink">
                  {d.description}
                </p>
              )}
            </div>
            <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-cherie-lace text-cherie-burgundy transition group-hover:border-cherie-burgundy group-hover:bg-cherie-burgundy group-hover:text-cherie-ivory">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
