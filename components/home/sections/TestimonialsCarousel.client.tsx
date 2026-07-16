'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, Quote, Heart } from 'lucide-react';

import type { Testimonial } from '@/lib/data/types';

const CHERIE_EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 6500;

/**
 * TestimonialsCarousel — a velvet editorial feature panel. One large serif
 * quotation at a time over a warm velvet stage with floating gold hearts, a
 * monogram, an index counter, and a live autoplay progress bar. Fully
 * accessible: prev/next, dots, play/pause, arrow keys, swipe. Autoplay never
 * runs on coarse pointers (mobile) or under reduced motion.
 */
export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const reduced = useReducedMotion();
  const groupId = useId();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [autoAvailable, setAutoAvailable] = useState(false);
  const count = testimonials.length;

  const go = useCallback(
    (next: number, d: number) => {
      setDir(d);
      setIndex((next + count) % count);
    },
    [count],
  );

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || reduced) return;
    setAutoAvailable(true);
    setPlaying(true);
  }, [reduced]);

  useEffect(() => {
    if (!playing || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [playing, count]);

  const startX = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 44) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    startX.current = null;
  };

  const active = testimonials[index];
  if (!active) return null;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Çift yorumları"
      className="relative mx-auto max-w-4xl"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1, 1);
        if (e.key === 'ArrowLeft') go(index - 1, -1);
      }}
    >
      {/* ── velvet feature stage ── */}
      <div
        className="cd-grain relative overflow-hidden rounded-card-lg border border-cherie-brass/25 bg-gradient-to-br from-cherie-velvet via-[#3a1620] to-cherie-velvet px-7 pb-14 pt-12 shadow-lift sm:px-16 sm:pb-16 sm:pt-14"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* floating gold hearts */}
        <span
          aria-hidden
          className="cd-ornament absolute right-10 top-10"
          style={{ '--lo': '0.14', '--hi': '0.34', '--dur': '9s' } as React.CSSProperties}
        >
          <Heart size={22} color="#c99a63" fill="#c99a63" strokeWidth={0} />
        </span>
        <span
          aria-hidden
          className="cd-ornament absolute bottom-16 left-8"
          style={
            {
              '--lo': '0.1',
              '--hi': '0.28',
              '--dur': '11s',
              '--delay': '2s',
            } as React.CSSProperties
          }
        >
          <Heart size={14} color="#e8d8c7" fill="#e8d8c7" strokeWidth={0} />
        </span>

        {/* oversized quotation glyph */}
        <Quote
          aria-hidden
          className="absolute -left-2 -top-3 h-24 w-24 rotate-180 text-cherie-brass/20 sm:h-32 sm:w-32"
          strokeWidth={1}
        />

        {/* index counter */}
        <div className="relative mb-6 flex items-center justify-center gap-3 text-cherie-brass">
          <span className="font-display text-lg tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="h-px w-8 bg-cherie-brass/50" />
          <span className="font-display text-lg tabular-nums text-cherie-lace/60">
            {String(count).padStart(2, '0')}
          </span>
        </div>

        <div className="relative min-h-[15rem] sm:min-h-[13rem]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={active.id}
              id={`${groupId}-slide-${index}`}
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${count}`}
              custom={dir}
              initial={{ opacity: 0, x: reduced ? 0 : dir * 44 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduced ? 0 : dir * -44 }}
              transition={{ duration: reduced ? 0.15 : 0.55, ease: CHERIE_EASE }}
              className="text-center"
            >
              <blockquote className="mx-auto max-w-3xl font-display text-[1.6rem] leading-[1.45] text-cherie-ivory sm:text-[2.2rem] sm:leading-[1.4]">
                &ldquo;{active.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-9 flex items-center justify-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-cherie-brass/50 bg-cherie-ink/30">
                  <Heart
                    className="h-5 w-5 text-cherie-brass"
                    fill="currentColor"
                    strokeWidth={0}
                    aria-hidden
                  />
                </span>
                <span className="text-left">
                  <span className="block font-medium tracking-wide text-cherie-ivory">
                    {active.client_display_name ?? 'CHERIE DAY Çifti'}
                  </span>
                  <span className="mt-0.5 block text-sm text-cherie-lace/70">
                    {active.event_type ? (
                      <span className="text-cherie-brass">{active.event_type}</span>
                    ) : null}
                    {active.event_type && active.location ? ' · ' : ''}
                    {active.location}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* live autoplay progress bar */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[3px] bg-cherie-ivory/10"
        >
          {autoAvailable && playing && !reduced ? (
            <motion.div
              key={index}
              className="h-full bg-cherie-brass"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
            />
          ) : (
            <div
              className="h-full bg-cherie-brass/60 transition-all duration-500"
              style={{ width: `${((index + 1) / count) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* ── controls ── */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => go(index - 1, -1)}
          aria-label="Önceki yorum"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cherie-lace text-cherie-ink transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-burgundy"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>

        <div className="flex shrink-0 items-center gap-2" role="tablist" aria-label="Yorum seç">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls={`${groupId}-slide-${i}`}
              aria-label={`${i + 1}. yoruma git`}
              onClick={() => go(i, i > index ? 1 : -1)}
              className="grid size-11 place-items-center"
            >
              <span
                className={`block rounded-full transition-all duration-control ease-cherie ${
                  i === index
                    ? 'h-2 w-6 bg-cherie-burgundy'
                    : 'h-2 w-2 bg-cherie-lace hover:bg-cherie-brass'
                }`}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index + 1, 1)}
          aria-label="Sonraki yorum"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cherie-lace text-cherie-ink transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-burgundy"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>

        {autoAvailable && count > 1 ? (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Otomatik geçişi durdur' : 'Otomatik geçişi başlat'}
            className="ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cherie-lace text-cherie-soft-ink transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-burgundy"
          >
            {playing ? (
              <Pause className="h-4 w-4" aria-hidden />
            ) : (
              <Play className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
