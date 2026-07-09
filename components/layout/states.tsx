import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/** Empty state (docs/44). Always offers a path forward — never a dead end. */
export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-cherie-lace bg-cherie-paper/50 px-6 py-14 text-center">
      <p className="font-display text-xl text-cherie-ink">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-cherie-soft-ink">{description}</p>}
      {ctaLabel && ctaHref && (
        <Button asChild variant="secondary" className="mt-6">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </div>
  );
}

/** Error state (docs/44 §1). */
export function ErrorState({ ctaHref = '/', ctaLabel = 'Ana Sayfa' }: { ctaHref?: string; ctaLabel?: string }) {
  return (
    <EmptyState
      title="Bir şeyler ters gitti"
      description="Bir şeyler ters gitti. Lütfen tekrar deneyin."
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
    />
  );
}

/** Card-grid skeleton reserving final dimensions (no CLS, docs/29). */
export function CardGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-card bg-cherie-paper" />
          <div className="mt-3 h-4 w-3/4 rounded bg-cherie-paper" />
          <div className="mt-2 h-3 w-1/2 rounded bg-cherie-paper" />
        </div>
      ))}
    </div>
  );
}
