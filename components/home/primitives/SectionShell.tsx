import { cn } from '@/lib/utils';

/**
 * SectionShell — the editorial rhythm every homepage section shares:
 * burgundy eyebrow → display heading → optional lede → brass hairline rule.
 * Keeps the awe→understanding→desire→trust→action arc typographically
 * consistent (pre-production lock §3: editorial, asymmetric, restrained).
 */
export function SectionShell({
  eyebrow,
  title,
  lede,
  className,
  headerClassName,
  align = 'left',
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center';
  children: React.ReactNode;
}) {
  return (
    <section className={cn('py-20 md:py-28', className)}>
      <div className="cherie-container">
        <header
          className={cn(
            'max-w-2xl',
            align === 'center' && 'mx-auto text-center',
            headerClassName,
          )}
        >
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cherie-burgundy">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-h2 text-cherie-ink">{title}</h2>
          {lede ? (
            <p className="mt-4 text-base leading-7 text-cherie-soft-ink md:text-lg md:leading-8">
              {lede}
            </p>
          ) : null}
          <div
            className={cn(
              'mt-8 h-px w-16 bg-cherie-brass/60',
              align === 'center' && 'mx-auto',
            )}
          />
        </header>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
