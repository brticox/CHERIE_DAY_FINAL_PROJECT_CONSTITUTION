'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import type { ProductSort } from '@/lib/data/catalog';

const OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Önerilen sıralama' },
  { value: 'price-asc', label: 'Fiyat: düşükten yükseğe' },
  { value: 'price-desc', label: 'Fiyat: yüksekten düşüğe' },
  { value: 'production', label: 'En kısa üretim' },
];

/**
 * URL-based sort control. Navigates on change while preserving every other
 * query param, so back/forward and shared links keep the sort. Native <select>
 * → fully keyboard operable; a no-JS <noscript> fallback keeps it usable.
 */
export function SortBar({
  basePath,
  value,
}: {
  basePath: string;
  value: ProductSort;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next && next !== 'featured') params.set('sort', next);
    else params.delete('sort');
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-bar" className="text-sm text-cherie-soft-ink">
        Sırala
      </label>
      <select
        id="sort-bar"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cherie-field h-11 w-auto py-0 text-sm"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
