import { cn } from '@/lib/utils';

/**
 * Tasteful placeholder frame used until real product/collection imagery is
 * produced (docs/16 asset production is a later dependency). Reserves aspect
 * ratio to avoid layout shift (docs/29).
 */
export function MediaFrame({
  label,
  ratio = 'aspect-[4/5]',
  className,
}: {
  label: string;
  ratio?: string;
  className?: string;
}) {
  const initials = label.trim().slice(0, 1).toLocaleUpperCase('tr');
  return (
    <div
      className={cn(
        ratio,
        'flex items-center justify-center overflow-hidden rounded-card border border-cherie-lace bg-gradient-to-br from-cherie-paper to-cherie-mist',
        className,
      )}
      aria-hidden
    >
      <span className="font-display text-4xl text-cherie-brass/70">{initials}</span>
    </div>
  );
}
