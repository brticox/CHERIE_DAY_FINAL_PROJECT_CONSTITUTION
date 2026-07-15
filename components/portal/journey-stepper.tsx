import { Check } from 'lucide-react';

import type { OrderJourney } from '@/lib/orders/journey';
import { cn } from '@/lib/utils';

/**
 * Accessible horizontal journey stepper. State is conveyed through icon + shape
 * + text (an aria-current marker and a "Aşama n/8" summary), never colour alone,
 * so it reads correctly for colour-blind and screen-reader users. On small
 * screens the node row stays compact (dots only) and the textual summary carries
 * the meaning; full stage labels appear from lg upward.
 */
export function JourneyStepper({
  journey,
  className,
}: {
  journey: OrderJourney;
  className?: string;
}) {
  const total = journey.stages.length;
  const current = journey.stages.find((stage) => stage.state === 'current');
  const completed = journey.stages.filter((stage) => stage.state === 'complete').length;
  const summary = journey.isTerminal
    ? journey.terminal === 'refunded'
      ? 'Sipariş kapandı · İade tamamlandı'
      : 'Sipariş kapandı · İptal edildi'
    : current
      ? `Aşama ${current.index + 1}/${total} · ${current.title}`
      : `${completed}/${total} aşama tamamlandı`;

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cherie-soft-ink">
        {summary}
      </p>
      <ol className="mt-4 flex items-start" aria-label="Sipariş yolculuğu">
        {journey.stages.map((stage, index) => {
          const isLast = index === total - 1;
          const done = stage.state === 'complete';
          const isCurrent = stage.state === 'current';
          const halted = stage.state === 'halted';
          return (
            <li
              key={stage.key}
              className={cn('flex min-w-0 flex-1 flex-col items-center', isLast && 'flex-none')}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors',
                    done && 'border-cherie-burgundy bg-cherie-burgundy text-cherie-ivory',
                    isCurrent &&
                      'border-2 border-cherie-burgundy bg-cherie-ivory text-cherie-burgundy ring-4 ring-cherie-burgundy/10',
                    stage.state === 'upcoming' &&
                      'border-cherie-lace bg-cherie-paper text-cherie-soft-ink',
                    halted && 'border-dashed border-cherie-lace bg-cherie-paper text-cherie-soft-ink',
                  )}
                >
                  {done ? (
                    <Check className="size-4" strokeWidth={2.4} aria-hidden />
                  ) : halted ? (
                    <span aria-hidden>—</span>
                  ) : (
                    <span aria-hidden>{index + 1}</span>
                  )}
                </span>
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      'mx-1 h-0.5 flex-1 rounded-full',
                      done ? 'bg-cherie-burgundy' : 'bg-cherie-lace',
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'mt-2 hidden text-center text-xs leading-tight lg:block',
                  isCurrent ? 'font-semibold text-cherie-ink' : 'text-cherie-soft-ink',
                )}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
      {current && (
        <p className="mt-3 text-sm text-cherie-soft-ink lg:hidden">{current.hint}</p>
      )}
    </div>
  );
}
