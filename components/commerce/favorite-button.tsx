'use client';

import { useState } from 'react';
import { Heart, LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useFavorites } from './favorites-provider';

const LABEL_ADD = 'Seçtiklerime ekle';
const LABEL_REMOVE = 'Seçtiklerimden çıkar';
const FEEDBACK_SAVED = 'Maison’inize kaydedildi';
const FEEDBACK_REMOVED = 'Seçtiklerinizden çıkarıldı';

/**
 * Refined save control for the Seçtiklerim (favorites) feature.
 *
 * `card` — a 44×44 circular control overlaid on a product image. It is a
 * sibling of (never nested inside) the card's navigation Link, and stops
 * propagation, so saving never triggers navigation. `pdp` — an inline control
 * beside the primary "Seçimlerime ekle" action, visually subordinate to it.
 *
 * Quiet-luxury treatment: an outline heart that fills with ink on save — no
 * red, no bounce, no gamified burst. Motion is a sub-200ms color/scale ease
 * that CSS `prefers-reduced-motion` users opt out of via the utility classes.
 */
export function FavoriteButton({
  productId,
  productName,
  variant = 'card',
  className,
}: {
  productId: string;
  productName: string;
  variant?: 'card' | 'pdp';
  className?: string;
}) {
  const { ready, has, isPending, toggle } = useFavorites();
  const saved = has(productId);
  const pending = isPending(productId);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function onClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const result = await toggle(productId);
    if (result.ok) {
      setFeedback(result.saved ? FEEDBACK_SAVED : FEEDBACK_REMOVED);
    } else {
      setFeedback(result.message ?? 'İşlem tamamlanamadı.');
    }
  }

  const label = saved ? `${LABEL_REMOVE}: ${productName}` : `${LABEL_ADD}: ${productName}`;

  if (variant === 'pdp') {
    return (
      <>
        <button
          type="button"
          onClick={onClick}
          disabled={!ready || pending}
          aria-pressed={saved}
          aria-label={label}
          className={cn(
            'inline-flex min-h-12 items-center justify-center gap-2 rounded-control border px-5 text-sm font-semibold transition-[color,background-color,border-color] duration-control ease-cherie focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:opacity-50',
            saved
              ? 'border-cherie-burgundy bg-cherie-paper text-cherie-burgundy'
              : 'border-cherie-lace bg-cherie-ivory text-cherie-ink hover:border-cherie-brass',
            className,
          )}
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <Heart
              className={cn('size-4', saved && 'fill-current')}
              strokeWidth={1.8}
              aria-hidden
            />
          )}
          {saved ? 'Seçtiklerimde' : 'Seçtiklerime ekle'}
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {feedback}
        </span>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={!ready || pending}
        aria-pressed={saved}
        aria-label={label}
        className={cn(
          'grid size-11 place-items-center rounded-full bg-cherie-ivory/90 text-cherie-burgundy shadow-card backdrop-blur-sm transition-[color,transform] duration-control ease-cherie hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:opacity-60 motion-reduce:transform-none',
          className,
        )}
      >
        {pending ? (
          <LoaderCircle className="size-[18px] animate-spin" aria-hidden />
        ) : (
          <Heart
            className={cn('size-[18px]', saved && 'fill-current')}
            strokeWidth={1.8}
            aria-hidden
          />
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {feedback}
      </span>
    </>
  );
}
