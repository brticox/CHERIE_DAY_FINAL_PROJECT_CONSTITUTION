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
    <header className={cn('max-w-4xl', className)}>
      {eyebrow && <p className="cherie-kicker mb-4">{eyebrow}</p>}
      <h1 className="text-h1 max-w-3xl text-balance text-cherie-ink">{title}</h1>
      {lead && (
        <p className="mt-5 max-w-2xl text-lg leading-8 text-cherie-soft-ink">{lead}</p>
      )}
    </header>
  );
}
