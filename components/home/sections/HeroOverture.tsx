import Link from 'next/link';
import type { CSSProperties } from 'react';

import { ROUTES } from '@/lib/data/routes';
import { PRIMARY_CTA } from '@/lib/data/navigation';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { StageFrame } from '@/components/home/primitives/StageFrame';
import { HeroWebGL } from '@/components/home/hero/HeroWebGL';

/**
 * HeroOverture — Phase 3: SSR poster/fallback shell + pinned WebGL runway.
 *
 * The Phase 2A composition below is unchanged and REMAINS the poster: it
 * is the LCP, the no-JS render, and the fallback for mobile, reduced
 * motion, weak devices, and WebGL crashes. The only Phase 3 additions are
 * (a) the 300vh runway + sticky frame that pin the stage while scroll
 * scrubs the promise scene, and (b) the <HeroWebGL /> island — a client-
 * only, aria-hidden, pointer-events-none background stage that mounts
 * over the poster art and under the real HTML overture when WebGLGuard
 * approves. Text never enters the canvas.
 */

/** Phase 3 runway length — tune after visual review (lab uses 400). */
const HERO_RUNWAY_VH = 300;

/**
 * Overture text choreography: driven by HeroStage via CSS vars written on
 * the runway host (fade windows are constants in HeroStage.client.tsx).
 * Defaults keep the text fully visible whenever the stage isn't running.
 */
const overtureTextStyle: CSSProperties = {
  opacity: 'var(--hero-text-opacity, 1)',
  pointerEvents: 'var(--hero-text-events, auto)' as CSSProperties['pointerEvents'],
};

export function HeroOverture() {
  return (
    /* the runway: scroll travel for the pinned stage; collapses to one
       viewport under reduced motion (stylesheet !important beats the
       inline height, and the guard never mounts the canvas there) */
    <section
      data-hero-runway
      className="relative motion-reduce:!h-[100svh]"
      style={{ height: `${HERO_RUNWAY_VH}vh` }}
    >
      <StageFrame stage="hero" className="sticky top-0 h-[100svh] bg-cherie-ivory">
        {/* ── Background: sky + warm key light + drifting light strata ── */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-cherie-ivory via-cherie-mist to-cherie-paper"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(58% 52% at 26% 16%, rgba(176,138,87,0.14) 0%, rgba(176,138,87,0) 60%)',
          }}
        />
        <ParallaxLayer
          aria-hidden
          depth={-3}
          className="absolute -left-24 top-[12%] h-56 w-[42rem] rounded-full bg-cherie-lace/50 blur-3xl"
        />
        <ParallaxLayer
          aria-hidden
          depth={-6}
          className="absolute -right-32 top-[28%] h-64 w-[46rem] rounded-full bg-cherie-mist/80 blur-3xl"
        />
        <ParallaxLayer
          aria-hidden
          depth={-8}
          className="absolute left-[16%] bottom-[14%] h-48 w-[36rem] rounded-full bg-cherie-lace/40 blur-3xl"
        />

        {/* ── The promise, suggested: ribbon curving to a ring/light at center ── */}
        <ParallaxLayer aria-hidden depth={6} className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <svg
            viewBox="0 0 1200 360"
            fill="none"
            className="mx-auto w-full max-w-6xl"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="heroTouchGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#B08A57" stopOpacity="0.5" />
                <stop offset="0.4" stopColor="#B08A57" stopOpacity="0.16" />
                <stop offset="1" stopColor="#B08A57" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* red ribbon — the connector, arcing toward the center */}
            <path
              d="M70 120 C 280 120, 360 250, 600 250 C 840 250, 920 120, 1130 120"
              stroke="#8F1D2C"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* the light of the promise, dead center */}
            <circle cx="600" cy="250" r="66" fill="url(#heroTouchGlow)" />
            {/* the ring hint */}
            <circle cx="600" cy="250" r="8.5" stroke="#B08A57" strokeWidth="2.5" />
            <circle cx="600" cy="250" r="2" fill="#B08A57" />
          </svg>
        </ParallaxLayer>

        {/* ── Foreground foliage blurs (nearest planes, strongest drift) ── */}
        <ParallaxLayer
          aria-hidden
          depth={12}
          className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cherie-velvet/10 blur-2xl"
        />
        <ParallaxLayer
          aria-hidden
          depth={10}
          className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-cherie-burgundy/10 blur-2xl"
        />

        {/* ── The WebGL stage (Phase 3): client-only island, mounts over the
            poster art and under the overture text when the guard approves ── */}
        <HeroWebGL />

        {/* ── Overture — real HTML, above the stage, choreographed via vars ── */}
        <div
          className="cherie-container relative z-10 flex h-full flex-col items-center justify-center py-24 text-center"
          style={overtureTextStyle}
        >
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-cherie-brass">
            CHERIE DAY · Maison
          </p>
          <h1 className="mt-6 max-w-4xl text-display-xl text-cherie-ink">
            Her şey bir dokunuşla başlar.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-cherie-soft-ink md:text-lg md:leading-8">
            Sözünüzün ilk anından son hatırasına; davetiyeden organizasyona,
            hediyeden albüme — bütün bir gün, tek bir imzayla.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={PRIMARY_CTA.href}
              className="inline-flex h-12 items-center justify-center rounded-control bg-cherie-burgundy px-8 text-base font-medium text-cherie-ivory transition-colors duration-control ease-cherie hover:bg-cherie-cherry"
            >
              {PRIMARY_CTA.label}
            </Link>
            <Link
              href={ROUTES.maison}
              className="inline-flex h-12 items-center justify-center rounded-control border border-cherie-burgundy bg-cherie-ivory/70 px-8 text-base font-medium text-cherie-burgundy backdrop-blur-sm transition-colors duration-control ease-cherie hover:bg-cherie-paper"
            >
              Maison&rsquo;u Keşfet
            </Link>
          </div>

          {/* scroll cue */}
          <div aria-hidden className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="h-14 w-px animate-pulse bg-gradient-to-b from-transparent via-cherie-brass to-transparent" />
          </div>
        </div>
      </StageFrame>
    </section>
  );
}
