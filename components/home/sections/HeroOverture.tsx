import Link from 'next/link';
import type { CSSProperties } from 'react';

import { ROUTES } from '@/lib/data/routes';
import { PRIMARY_CTA } from '@/lib/data/navigation';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { StageFrame } from '@/components/home/primitives/StageFrame';
import { HeroWebGL } from '@/components/home/hero/HeroWebGL';
import { HeroLightField } from '@/components/home/hero/HeroLightField.client';
import lightStyles from '@/components/home/hero/HeroLightField.module.css';

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
 * Phase 5B poster image kill-switch — flip to `false` to fall back to the
 * Phase 2A CSS/SVG poster instantly (the image is never requested).
 */
const HERO_POSTER_IMAGE_ENABLED = true;

/**
 * Cinematic scene kill-switch ("the breathing photograph"). Flip to
 * `false` to restore the plain approved still + base motion layer: no
 * camera breath/push-in, no depth plate, no candle/sheen/glint/grade
 * layers, no scroll timeline.
 */
const HERO_CINEMATIC_ENABLED = true;

/**
 * Veil depth plate mask — a wide-feathered ellipse over the veil/lace
 * mass at frame-left. The plate is the full C1 image again (offsets can
 * never open holes); the feather lands in the dark field and busy lace
 * texture, and its pointer delta vs the base poster stays ≤3px, so no
 * ghosting on the hands.
 */
const VEIL_PLATE_MASK =
  'radial-gradient(42% 78% at 10% 56%, #000 45%, transparent 78%)';

/**
 * Hands-only hero poster set (hero art-direction reset). Desktop = C1
 * creation-near-touch (16:9, candlelit hands, touch point at ~48%/45%);
 * mobile = dark 9:16 crop of the SAME C1 master (band x600–1248: ring at
 * left third, touch bead at ~63%/46%, ring-safe under 19.5:9 cover-crop)
 * so both breakpoints live in one candlelit world. The full bride/groom
 * F1 frame and the ivory G2 mobile plate are retired from the visible
 * hero (their poster files remain archived in the same directory).
 * The 1024px breakpoint matches the WebGL guard's viewport gate.
 */
const POSTER = {
  base: '/home/hero/posters',
  desktopWidths: [2560, 1920, 1280, 960],
  mobileWidths: [1080, 750],
  srcset(variant: 'desktop' | 'mobile', ext: 'avif' | 'webp' | 'jpg'): string {
    const widths = variant === 'desktop' ? this.desktopWidths : this.mobileWidths;
    const name = variant === 'desktop' ? 'poster-hands-desktop' : 'poster-hands-mobile-dark';
    return widths.map((w) => `${this.base}/${name}-${w}.${ext} ${w}w`).join(', ');
  },
};

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

        {/* ── Dark underlay (all breakpoints): both hero plates are dark
            candlelit C1 crops and the overture text is ivory, so the
            image-failure/no-image state must also be dark. Umber tones
            sampled from C1's field. ── */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 42%, #2b1e18 0%, #17100c 55%, #0e0a08 100%)',
          }}
        />

        {/* ── Hands-only poster image: C1 (desktop) / G2 (mobile) over the
            CSS poster layers, under the canvas and text. The CSS/SVG layers
            stay beneath as instant first paint and image-failure fallback.
            Wrapper stack: overflow clip → scroll push-in (var transform) →
            camera breath (keyframe transform) — separate elements so the
            two transform sources never fight, all composite-only. ── */}
        {HERO_POSTER_IMAGE_ENABLED ? (
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{ transform: 'scale(calc(1 + var(--hero-rich, 0) * 0.028))' }}
            >
              <div className={`absolute inset-0 ${lightStyles.cameraBreath}`}>
                <picture>
            <source
              type="image/avif"
              media="(min-width: 1024px)"
              srcSet={POSTER.srcset('desktop', 'avif')}
              sizes="100vw"
            />
            <source
              type="image/webp"
              media="(min-width: 1024px)"
              srcSet={POSTER.srcset('desktop', 'webp')}
              sizes="100vw"
            />
            <source
              type="image/avif"
              media="(max-width: 1023px)"
              srcSet={POSTER.srcset('mobile', 'avif')}
              sizes="100vw"
            />
            <source
              type="image/webp"
              media="(max-width: 1023px)"
              srcSet={POSTER.srcset('mobile', 'webp')}
              sizes="100vw"
            />
            <img
              src={`${POSTER.base}/poster-hands-desktop-1920.jpg`}
              srcSet={`${POSTER.srcset('desktop', 'jpg')}, ${POSTER.srcset('mobile', 'jpg')}`}
              sizes="100vw"
              alt=""
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center"
              /* vars are written by useHeroPointer only on fine-pointer
                 desktop without reduced motion; everywhere else the
                 defaults keep this an identity transform (approved
                 framing, zero layout shift) */
              style={{
                transform:
                  'translate3d(calc(var(--hero-pointer-x, 0) * -10px), calc(var(--hero-pointer-y, 0) * -7px), 0) scale(var(--hero-para-s, 1))',
              }}
            />
                </picture>

                {/* ── Veil depth plate: the full image again, feather-masked
                    to the veil mass and moving 3px more than the base — a
                    2.5D read with zero cut-edge risk. Same srcset as the
                    poster (browser cache hit), lazy, desktop-only. ── */}
                {HERO_CINEMATIC_ENABLED ? (
                  <picture>
                    <source
                      type="image/avif"
                      media="(min-width: 1024px)"
                      srcSet={POSTER.srcset('desktop', 'avif')}
                      sizes="100vw"
                    />
                    <img
                      src={`${POSTER.base}/poster-hands-desktop-1920.jpg`}
                      srcSet={POSTER.srcset('desktop', 'jpg')}
                      sizes="100vw"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 hidden h-full w-full object-cover object-center lg:block"
                      style={{
                        WebkitMaskImage: VEIL_PLATE_MASK,
                        maskImage: VEIL_PLATE_MASK,
                        transform:
                          'translate3d(calc(var(--hero-pointer-x, 0) * -13px), calc(var(--hero-pointer-y, 0) * -9px), 0) scale(var(--hero-para-s, 1))',
                      }}
                    />
                  </picture>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* ── The WebGL stage (Phase 3): client-only island, mounts over the
            poster art and under the overture text when the guard approves ── */}
        <HeroWebGL />

        {/* ── Legibility scrim: both plates are dark candlelit C1 crops and
            the text is ivory, so one quiet dark radial deepens the field
            behind the overture (no ivory fog over the painting). Rides the
            choreography var. ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 'var(--hero-text-opacity, 1)',
            background:
              'radial-gradient(58% 55% at 50% 52%, rgba(12,8,6,0.48) 0%, rgba(12,8,6,0.26) 45%, rgba(12,8,6,0) 72%)',
          }}
        />

        {/* ── Motion layer: pointer-reactive candlelight, load bloom, gold
            dust, film grain — and, when cinematic, candle flicker, silk
            sheen, ring glints, and the scroll-driven grade. CSS-only,
            pointer-events-none, desktop-only; sits over poster + scrims,
            under the overture text. ── */}
        <HeroLightField cinematic={HERO_CINEMATIC_ENABLED} />

        {/* ── Overture — real HTML, above the stage, choreographed via vars ── */}
        <div
          className="cherie-container relative z-10 flex h-full flex-col items-center justify-center py-24 text-center"
          style={overtureTextStyle}
        >
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-cherie-brass">
            CHERIE DAY · Maison
          </p>
          <h1 className="mt-6 max-w-4xl text-display-xl text-cherie-ivory">
            Her şey bir dokunuşla başlar.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-cherie-ivory/80 md:text-lg md:leading-8">
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
              className="inline-flex h-12 items-center justify-center rounded-control border border-cherie-ivory/50 bg-cherie-ivory/10 px-8 text-base font-medium text-cherie-ivory backdrop-blur-sm transition-colors duration-control ease-cherie hover:bg-cherie-ivory/20"
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
