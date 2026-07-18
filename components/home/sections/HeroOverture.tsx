import Link from 'next/link';
import type { CSSProperties } from 'react';

import { ROUTES } from '@/lib/data/routes';
import { PRIMARY_CTA } from '@/lib/data/navigation';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { StageFrame } from '@/components/home/primitives/StageFrame';
import { HeroWebGL } from '@/components/home/hero/HeroWebGL';
import { HeroLightField } from '@/components/home/hero/HeroLightField.client';
import { HeroVideoScrub } from '@/components/home/hero/HeroVideoScrub.client';
import { HeroStoreIcon } from '@/components/home/hero/HeroStoreIcon.client';
import lightStyles from '@/components/home/hero/HeroLightField.module.css';

/**
 * HeroOverture — Phase 3: SSR poster shell + pinned runway + scroll-scrubbed video.
 *
 * Layer stack (back → front):
 *   1. Warm umber underlay          — instant first paint, image-failure safe
 *   2. Parallax atmosphere blurs    — CSS var depth planes
 *   3. hero-source.png              — camera breath + pointer parallax (LCP)
 *   4. Ribbon depth plate           — same image masked to the flowing ribbon
 *                                     at upper-left, 3 px more parallax → 2.5D
 *   5. HeroVideoScrub               — scroll-scrubbed video (opacity 0→1→0)
 *   6. HeroWebGL                    — (kill-switched; reserved R3F slot)
 *   7. Legibility scrims            — dark radial + mobile bottom gradient
 *   8. HeroLightField               — CSS-only candles / glow / dust / grain
 *   9. Overture HTML                — heading, subtitle, CTAs (always on top)
 */

/** Runway length — scroll travel for the pinned stage. */
const HERO_RUNWAY_VH = 450;

/**
 * Cinematic kill-switch — flip to false to disable candle flicker,
 * silk sheen, glints and scroll grade while keeping base glow + dust.
 */
const HERO_CINEMATIC_ENABLED = true;

/**
 * Ribbon/fabric depth plate mask.
 * Covers the flowing burgundy ribbon at the upper-left of the new artwork.
 * Same full image is used (browser cache hit, never opens a hole).
 */
const RIBBON_DEPTH_MASK =
  'radial-gradient(44% 60% at 20% 26%, #000 40%, transparent 74%)';

/** New hero artwork paths. */
const HERO_DESKTOP = '/home/hero/posters/hero-source.png';
const HERO_MOBILE = '/home/hero/posters/hero-mobile-source.png';

/**
 * Next-gen format variants of the same artwork, pixel-identical crop/dimensions
 * to HERO_DESKTOP / HERO_MOBILE. <source type> negotiation picks the smallest
 * format the browser supports; the original PNGs remain the universal fallback.
 */
const HERO_DESKTOP_AVIF = '/home/hero/posters/hero-source.avif';
const HERO_DESKTOP_WEBP = '/home/hero/posters/hero-source.webp';
const HERO_MOBILE_AVIF = '/home/hero/posters/hero-mobile-source.avif';
const HERO_MOBILE_WEBP = '/home/hero/posters/hero-mobile-source.webp';

/**
 * Overture text choreography vars — written by HeroStage onto the runway.
 * Defaults keep text fully visible when the stage isn't running.
 */
const textStyle: CSSProperties = {
  opacity: 'var(--hero-text-opacity, 1)',
  pointerEvents: 'var(--hero-text-events, auto)' as CSSProperties['pointerEvents'],
};

export function HeroOverture() {
  return (
    <section
      data-hero-runway
      className="relative motion-reduce:!h-[100svh]"
      style={{ height: `${HERO_RUNWAY_VH}vh` }}
    >
      <StageFrame stage="hero" className="sticky top-0 h-[100svh] bg-[#1a0f09]">
        {/* ── 1. Warm umber underlay (instant paint + image-failure fallback) ── */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 42%, #2e1c11 0%, #1a0f09 55%, #0e0906 100%)',
          }}
        />

        {/* ── 2. Atmosphere key light ── */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(62% 56% at 50% 38%, rgba(210,158,72,0.18) 0%, transparent 65%)',
          }}
        />

        {/* ── Parallax blurs (CSS var depth planes) ── */}
        <ParallaxLayer
          aria-hidden
          depth={-3}
          className="absolute -left-24 top-[8%] h-56 w-[42rem] rounded-full bg-amber-950/25 blur-3xl"
        />
        <ParallaxLayer
          aria-hidden
          depth={-6}
          className="absolute -right-32 top-[22%] h-64 w-[46rem] rounded-full bg-amber-950/30 blur-3xl"
        />
        <ParallaxLayer
          aria-hidden
          depth={-8}
          className="absolute bottom-[14%] left-[16%] h-48 w-[36rem] rounded-full bg-amber-900/15 blur-3xl"
        />
        <ParallaxLayer
          aria-hidden
          depth={12}
          className="bg-cherie-velvet/12 absolute -bottom-20 -left-20 h-72 w-72 rounded-full blur-2xl"
        />
        <ParallaxLayer
          aria-hidden
          depth={10}
          className="bg-cherie-burgundy/12 absolute -bottom-24 -right-16 h-80 w-80 rounded-full blur-2xl"
        />

        {/* ── 3. Hero poster: the new artwork with camera breath + parallax ── */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {/* scroll push-in wrapper */}
          <div
            className="absolute inset-0"
            style={{ transform: 'scale(calc(1 + var(--hero-rich, 0) * 0.028))' }}
          >
            {/* camera breath wrapper */}
            <div className={`absolute inset-0 ${lightStyles.cameraBreath}`}>
              {/* base image */}
              <picture>
                <source
                  type="image/avif"
                  media="(min-width: 1024px)"
                  srcSet={HERO_DESKTOP_AVIF}
                />
                <source
                  type="image/webp"
                  media="(min-width: 1024px)"
                  srcSet={HERO_DESKTOP_WEBP}
                />
                <source
                  type="image/png"
                  media="(min-width: 1024px)"
                  srcSet={HERO_DESKTOP}
                />
                <source
                  type="image/avif"
                  media="(max-width: 1023px)"
                  srcSet={HERO_MOBILE_AVIF}
                />
                <source
                  type="image/webp"
                  media="(max-width: 1023px)"
                  srcSet={HERO_MOBILE_WEBP}
                />
                <source
                  type="image/png"
                  media="(max-width: 1023px)"
                  srcSet={HERO_MOBILE}
                />
                <img
                  src={HERO_DESKTOP}
                  alt=""
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  style={{
                    transform:
                      'translate3d(calc(var(--hero-pointer-x,0)*-10px),calc(var(--hero-pointer-y,0)*-7px),0) scale(var(--hero-para-s,1))',
                  }}
                />
              </picture>

              {/* ── 4. Ribbon / fabric depth plate (2.5D) ── */}
              {HERO_CINEMATIC_ENABLED && (
                // Same desktop artwork as the base image above, masked to the
                // ribbon shape. Routed through the identical <picture> source
                // list so the browser reuses the already-cached AVIF/WebP
                // response instead of an extra fetch of the original PNG.
                <picture>
                  <source type="image/avif" srcSet={HERO_DESKTOP_AVIF} />
                  <source type="image/webp" srcSet={HERO_DESKTOP_WEBP} />
                  <source type="image/png" srcSet={HERO_DESKTOP} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HERO_DESKTOP}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 hidden h-full w-full object-cover object-center lg:block"
                    style={{
                      WebkitMaskImage: RIBBON_DEPTH_MASK,
                      maskImage: RIBBON_DEPTH_MASK,
                      transform:
                        'translate3d(calc(var(--hero-pointer-x,0)*-13px),calc(var(--hero-pointer-y,0)*-9px),0) scale(var(--hero-para-s,1))',
                    }}
                  />
                </picture>
              )}
            </div>
          </div>
        </div>

        {/* ── 5. Scroll-scrubbed cinematic video ── */}
        <HeroVideoScrub />

        {/* ── 6. WebGL stage (kill-switched, reserved) ── */}
        <HeroWebGL />

        {/* ── 7a. Centre legibility scrim (rides choreography var) ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 'var(--hero-text-opacity, 1)',
            background:
              'radial-gradient(58% 55% at 50% 52%, rgba(10,6,4,0.50) 0%, rgba(10,6,4,0.26) 45%, rgba(10,6,4,0) 72%)',
          }}
        />

        {/* ── 7b. Mobile bottom gradient ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              'linear-gradient(to top, rgba(10,6,4,0.80) 0%, rgba(10,6,4,0.46) 26%, rgba(10,6,4,0) 52%)',
          }}
        />

        {/* ── 8. HeroLightField — candles / glow / dust / grain ── */}
        <HeroLightField cinematic={HERO_CINEMATIC_ENABLED} />

        {/* ── 9. Overture text ── */}
        <div
          className="cherie-container relative z-10 flex h-full flex-col items-center justify-end pb-12 text-center lg:justify-center lg:py-24"
          style={textStyle}
        >
          <div className="flex flex-col items-center delay-300 duration-1000 animate-in fade-in slide-in-from-bottom-8 fill-mode-both">

            <h1 className="lg:text-display-xl mt-4 max-w-4xl font-display text-[2.75rem] leading-[1.05] text-cherie-ivory drop-shadow-lg lg:mt-6">
              <span className="hidden sm:inline">Bir dokunuşunuz yeter;</span>
              <span className="sm:hidden">Dokunuşunuz yeter;</span> <br />
              gerisi bize emanet.
            </h1>
            <p className="mt-4 max-w-xl px-2 text-sm leading-relaxed text-cherie-ivory/90 drop-shadow-md md:text-lg md:leading-8 lg:mt-6">
              İlk ‘evet’in heyecanı, son dansın ışığı sizin; davetiyeden albüme, her
              ince detay bizim.
            </p>
          </div>

          <div className="delay-500 mt-8 flex w-full flex-col items-center justify-center gap-3 px-6 duration-1000 animate-in fade-in slide-in-from-bottom-8 fill-mode-both sm:w-auto sm:flex-row lg:mt-10">
            <Link
              href={PRIMARY_CTA.href}
              className="flex h-12 w-full items-center justify-center rounded-control bg-cherie-burgundy px-8 text-sm font-medium text-cherie-ivory shadow-[0_4px_20px_rgba(58,16,24,0.4)] transition-all duration-control ease-cherie hover:bg-cherie-cherry hover:shadow-[0_4px_25px_rgba(58,16,24,0.6)] sm:w-auto"
            >
              {PRIMARY_CTA.label}
            </Link>
            <Link
              href={ROUTES.maison}
              className="flex h-12 w-full items-center justify-center rounded-control border border-cherie-ivory/30 bg-cherie-ivory/10 px-8 text-sm font-medium text-cherie-ivory shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-control ease-cherie hover:bg-cherie-ivory/20 sm:w-auto"
            >
              Maison&rsquo;u Keşfet
            </Link>
          </div>

          {/* scroll cue — desktop only */}
          <div
            aria-hidden
            className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 lg:block"
          >
            <div className="h-14 w-px animate-pulse bg-gradient-to-b from-transparent via-cherie-brass to-transparent" />
          </div>
        </div>

        {/* ── 10. Floating Store Icon (Desktop Only) ── */}
        <HeroStoreIcon />
      </StageFrame>
    </section>
  );
}
