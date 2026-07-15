import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3, PauseCircle, Sparkles } from 'lucide-react';

import type { NextAction, NextActionTone } from '@/lib/orders/journey';
import { cn } from '@/lib/utils';

const TONE_ICON: Record<NextActionTone, typeof Sparkles> = {
  action: Sparkles,
  progress: Clock3,
  success: CheckCircle2,
  halted: PauseCircle,
};

/**
 * The single, dominant "next thing" surface. The `action` tone is visually
 * loudest (velvet field, solid CTA) because it is the only tone that asks the
 * customer to do something; progress/success/halted are calm and reassuring.
 */
export function NextActionCard({
  action,
  eyebrow,
  className,
}: {
  action: NextAction;
  eyebrow?: string;
  className?: string;
}) {
  const Icon = TONE_ICON[action.tone];
  const isAction = action.tone === 'action';

  return (
    <section
      aria-label={`Sıradaki adım: ${action.title}`}
      className={cn(
        'relative overflow-hidden rounded-card-lg border p-6 shadow-card md:p-8',
        isAction
          ? 'border-cherie-burgundy/30 bg-cherie-velvet text-cherie-ivory'
          : action.tone === 'success'
            ? 'border-cherie-success/30 bg-cherie-success/[0.06] text-cherie-ink'
            : action.tone === 'halted'
              ? 'border-cherie-lace bg-cherie-paper/60 text-cherie-ink'
              : 'border-cherie-lace bg-cherie-ivory text-cherie-ink',
        className,
      )}
    >
      {isAction && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border border-cherie-brass/25"
        />
      )}
      <div className="relative">
        <p
          className={cn(
            'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]',
            isAction ? 'text-cherie-brass' : 'text-cherie-burgundy',
          )}
        >
          <Icon className="size-4" strokeWidth={1.8} aria-hidden />
          {eyebrow ?? action.kicker}
        </p>
        <h2
          className={cn(
            'mt-3 font-display text-2xl md:text-3xl',
            isAction ? 'text-cherie-ivory' : 'text-cherie-ink',
          )}
        >
          {action.title}
        </h2>
        <p
          className={cn(
            'mt-2 max-w-xl text-sm leading-7 md:text-base',
            isAction ? 'text-cherie-lace' : 'text-cherie-soft-ink',
          )}
        >
          {action.description}
        </p>
        {action.cta && (
          <Link
            href={action.cta.href}
            className={cn(
              'mt-6 inline-flex min-h-11 items-center gap-2 rounded-control px-5 text-sm font-semibold transition-transform duration-control ease-cherie hover:-translate-y-0.5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
              isAction
                ? 'bg-cherie-ivory text-cherie-burgundy focus-visible:ring-offset-cherie-velvet'
                : 'bg-cherie-burgundy text-cherie-ivory focus-visible:ring-offset-cherie-ivory',
            )}
          >
            {action.cta.label}
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}
