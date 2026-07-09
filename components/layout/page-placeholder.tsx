import Link from 'next/link';

import { cn } from '@/lib/utils';

type Crumb = { label: string; href?: string };

interface PagePlaceholderProps {
  /** Turkish page title. */
  title: string;
  /** Optional small eyebrow / section label (e.g. "Mağaza"). */
  eyebrow?: string;
  /** Optional Turkish description shown under the title. */
  description?: string;
  /** Optional breadcrumb trail (docs/40 §5). */
  breadcrumbs?: Crumb[];
  /** Phase note for developers — not customer-facing copy. */
  note?: string;
  className?: string;
}

/**
 * Neutral route-shell placeholder. Every canonical route renders one of these in
 * Phase 1 so the full IA (docs/40) resolves before any page has real content.
 * Real loading/empty/error states + copy come from docs/44 in later phases.
 */
export function PagePlaceholder({
  title,
  eyebrow,
  description,
  breadcrumbs,
  note = 'Bu bölüm yakında CHERIE DAY özenli içerikleriyle tamamlanacak.',
  className,
}: PagePlaceholderProps) {
  return (
    <section className={cn('cherie-container py-16 md:py-24', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Sayfa yolu" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-cherie-soft-ink">
            {breadcrumbs.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-cherie-burgundy">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <span aria-hidden>/</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {eyebrow && (
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-cherie-brass">
          {eyebrow}
        </p>
      )}

      <h1 className="text-h1 text-cherie-ink">{title}</h1>

      {description && (
        <p className="mt-4 max-w-2xl text-cherie-soft-ink">{description}</p>
      )}

      <p className="mt-8 inline-block rounded-card border border-dashed border-cherie-lace bg-cherie-paper/60 px-4 py-3 text-sm text-cherie-soft-ink">
        {note}
      </p>
    </section>
  );
}
