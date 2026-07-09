import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import type { Department } from '@/lib/data/types';
import { MediaFrame } from './media-frame';

/** Grid of shop departments (docs/40 §3.3). */
export function DepartmentGrid({ departments }: { departments: Department[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {departments.map((d) => (
        <Link
          key={d.id}
          href={`${ROUTES.magaza}/${d.slug}`}
          className="group rounded-card border border-cherie-lace bg-cherie-ivory p-4 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
        >
          <MediaFrame label={d.name_tr} ratio="aspect-[16/10]" />
          <h3 className="mt-4 text-h3 text-cherie-ink group-hover:text-cherie-burgundy">
            {d.name_tr}
          </h3>
          {d.description && (
            <p className="mt-1 text-sm text-cherie-soft-ink">{d.description}</p>
          )}
        </Link>
      ))}
    </div>
  );
}
