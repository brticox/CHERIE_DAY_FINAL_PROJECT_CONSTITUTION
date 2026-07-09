import { cn } from '@/lib/utils';

/** Editorial page header: eyebrow + poetic title + optional lead line (docs/39). */
export function PageHeader({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <header className={cn('max-w-3xl', className)}>
      {eyebrow && (
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-cherie-brass">{eyebrow}</p>
      )}
      <h1 className="text-h1 text-cherie-ink">{title}</h1>
      {lead && <p className="mt-4 text-body-lg text-cherie-soft-ink">{lead}</p>}
    </header>
  );
}
