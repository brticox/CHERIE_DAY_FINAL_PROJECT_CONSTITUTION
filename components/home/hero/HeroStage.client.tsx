'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { WebGLGuard } from '@/components/home/hero/WebGLGuard';
import { useScrollProgress } from '@/components/home/hero/useScrollProgress';
import { clamp01, window01 } from '@/components/home/hero/scene/math';

/**
 * The canvas is dynamically imported with ssr:false — three.js is never
 * evaluated on the server, and the three/r3f/postprocessing stack stays in
 * its own chunk, fetched only when the guard approves and the stage is
 * near the viewport (poster-first, Shopify-mirror lifecycle).
 */
const RibbonPromiseCanvas = dynamic(
  () =>
    import('@/components/home/hero/scene/RibbonPromiseScene').then(
      (m) => m.RibbonPromiseCanvas,
    ),
  { ssr: false, loading: () => null },
);

/* ── Phase 3 choreography constants (tune after visual review) ────────── */

/** Overture text fades out across this progress window… */
export const TEXT_FADE_OUT_START = 0.15;
export const TEXT_FADE_OUT_END = 0.3;
/** …and returns with the CTAs at the Duruş beat. */
export const TEXT_RETURN_START = 0.92;
export const TEXT_RETURN_END = 1;

/** Beat labels for the lab HUD (verification aid, workshop-only). */
function beatLabel(p: number): string {
  if (p < 0.15) return 'Giriş';
  if (p < 0.55) return 'Yaklaşma';
  if (p < 0.72) return 'Dokunuş';
  if (p < 0.92) return 'Doğuş';
  return 'Duruş';
}

/**
 * Debug override: ?p=0.6 pins the scene at that progress so beats can be
 * screenshot deterministically, independent of scroll. The lab enables it
 * permanently; the homepage island enables it only in development builds
 * (dead-code-eliminated from production).
 */
function parseForcedProgress(): number | null {
  const raw = new URLSearchParams(window.location.search).get('p');
  if (raw === null || raw.trim() === '') return null;
  const v = Number(raw);
  return Number.isFinite(v) ? clamp01(v) : null;
}

export interface HeroStageProps {
  /**
   * Own-runway mode (the lab): render a pinned section of this height and
   * host `children` (the poster) inside its sticky frame.
   * Omit for ATTACH mode (the homepage): render only the canvas layer and
   * measure the nearest `[data-hero-runway]` ancestor for scroll progress.
   */
  runwayVh?: number;
  /** Show the lab HUD (progress % + beat name). */
  hud?: boolean;
  /** Enable the ?p= progress override. */
  debug?: boolean;
  /**
   * Write `--hero-text-opacity` / `--hero-text-events` CSS vars onto the
   * runway host so the SSR overture text can choreograph with the scene.
   */
  textFade?: boolean;
  /** Sticky-frame content in own-runway mode (e.g. the lab poster). */
  children?: ReactNode;
}

/**
 * HeroStage — the proven /hero-lab engine, promoted for Phase 3.
 *
 * One component, two hosts:
 *  - `/hero-lab` (own-runway): 400vh pinned runway + HUD + ?p= override.
 *  - homepage (attach): mounts inside HeroOverture's SSR sticky frame,
 *    aria-hidden and pointer-events-none — background stage only, the
 *    real HTML overture stays the interactive, indexable surface.
 */
export function HeroStage({
  runwayVh,
  hud = false,
  debug = false,
  textFade = false,
  children,
}: HeroStageProps) {
  const attach = runwayVh === undefined;

  const hostRef = useRef<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const hudRef = useRef<HTMLSpanElement | null>(null);

  const scrollProgressRef = useScrollProgress(hostRef);
  /* the ref the canvas reads — single writer (the driver tick below) */
  const progressRef = useRef(0);
  const forcedRef = useRef<number | null>(null);

  const [inView, setInView] = useState(false);
  /* r3f event source for attach mode: the canvas layer is
     pointer-events-none, so pointer parallax listens on <body> instead */
  const [eventSource, setEventSource] = useState<HTMLElement | undefined>(undefined);

  /* attach mode: resolve the SSR runway host (declared first — later
     effects rely on hostRef being filled) */
  useEffect(() => {
    if (attach && anchorRef.current) {
      hostRef.current =
        anchorRef.current.closest<HTMLElement>('[data-hero-runway]');
      setEventSource(document.body);
    }
  }, [attach]);

  /* ?p= override, read once on mount when enabled */
  useEffect(() => {
    if (debug) forcedRef.current = parseForcedProgress();
  }, [debug]);

  /* canvas lifecycle: mount ~1.5 viewports early, unmount well past */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { rootMargin: '150% 0px 150% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* driver tick (rAF, no re-renders): resolves forced-vs-scroll progress,
     paints the HUD, and writes the text-choreography CSS vars */
  useEffect(() => {
    let raf = 0;
    let lastOpacity = -1;
    const tick = () => {
      const forced = forcedRef.current;
      const p = forced ?? scrollProgressRef.current;
      progressRef.current = p;

      if (hud && hudRef.current) {
        hudRef.current.textContent =
          forced !== null
            ? `Hero Lab · ${beatLabel(p)} · %${Math.round(p * 100)} · SABİT (?p=${forced})`
            : `Hero Lab · ${beatLabel(p)} · %${Math.round(p * 100)}`;
      }

      if (textFade) {
        const host = hostRef.current;
        if (host) {
          const opacity = clamp01(
            1 -
              window01(p, TEXT_FADE_OUT_START, TEXT_FADE_OUT_END) +
              window01(p, TEXT_RETURN_START, TEXT_RETURN_END),
          );
          const quantized = Math.round(opacity * 100) / 100;
          if (quantized !== lastOpacity) {
            lastOpacity = quantized;
            host.style.setProperty('--hero-text-opacity', String(quantized));
            host.style.setProperty(
              '--hero-text-events',
              quantized < 0.5 ? 'none' : 'auto',
            );
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hud, textFade, scrollProgressRef]);

  /* the guarded stage — canvas layer is decorative: hidden from AT,
     transparent to the pointer (overture links stay clickable) */
  const stage = inView ? (
    <WebGLGuard>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <RibbonPromiseCanvas progressRef={progressRef} eventSource={eventSource} />
      </div>
    </WebGLGuard>
  ) : null;

  if (attach) {
    return (
      <div ref={anchorRef} aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {stage}
      </div>
    );
  }

  return (
    <section
      ref={(el) => {
        hostRef.current = el;
      }}
      data-stage="hero-lab"
      data-hero-runway
      className="relative"
      style={{ height: `${runwayVh}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* poster: always present, always the LCP */}
        {children}

        {/* the stage: guarded, lifecycled, above the poster */}
        {stage}

        {/* scroll cue */}
        <div aria-hidden className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="h-14 w-px animate-pulse bg-gradient-to-b from-transparent via-cherie-brass to-transparent" />
        </div>

        {/* lab HUD (workshop verification aid) */}
        {hud ? (
          <span
            ref={hudRef}
            data-testid="lab-hud"
            className="absolute bottom-4 left-4 select-none font-ui text-[11px] tracking-[0.18em] text-cherie-brass/80"
          >
            Hero Lab · %0
          </span>
        ) : null}
      </div>
    </section>
  );
}
