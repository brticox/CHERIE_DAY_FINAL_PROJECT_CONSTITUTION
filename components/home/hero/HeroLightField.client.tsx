'use client';

import { useRef, type CSSProperties } from 'react';

import { useHeroPointer } from './useHeroPointer';
import { useHeroSceneProgress } from './useHeroSceneProgress';
import styles from './HeroLightField.module.css';

/**
 * HeroLightField — the hands-only hero's cinematic layer (no WebGL, no
 * canvas). A pointer-events-none, aria-hidden stack of CSS-only light over
 * the C1 poster: candle flicker with its cast halo, the breathing promise
 * glow, a one-shot load bloom, a silk sheen travelling over the veil
 * (light moves — pixels never deform), ring/touch glints, two gold-dust
 * drift fields, a scroll-driven burgundy/brass grade, film-stock color
 * breathing, and grain.
 *
 * Two var systems drive it, both written on the runway by hooks:
 *   --hero-pointer-x/y  (useHeroPointer)      — light direction + parallax
 *   --hero-wake/touch/rich (useHeroSceneProgress) — the scroll story
 *   --hero-ax/ay        (useHeroSceneProgress) — object-cover crop
 *                         compensation so glints stay glued to the ring
 *
 * Desktop-only (`hidden lg:block`): below lg the ivory G2 plate stays a
 * pure still. Reduced motion / no-JS / coarse pointer degrade to a static
 * candlelit photograph — animations are media-fenced, vars stay unset.
 */

type Speck = {
  x: number; // % of frame width
  y: number; // % of one drift cycle (0–100)
  size: number; // px
  opacity: number;
  blur?: number; // px
};

/* Deterministic constellations (SSR-safe — no randomness at render). */
const FAR_SPECKS: Speck[] = [
  { x: 8, y: 12, size: 2, opacity: 0.12 },
  { x: 22, y: 58, size: 1.5, opacity: 0.1 },
  { x: 31, y: 30, size: 2, opacity: 0.14 },
  { x: 44, y: 74, size: 1.5, opacity: 0.1 },
  { x: 52, y: 22, size: 2, opacity: 0.12 },
  { x: 63, y: 64, size: 1.5, opacity: 0.11 },
  { x: 71, y: 38, size: 2, opacity: 0.13 },
  { x: 83, y: 70, size: 1.5, opacity: 0.1 },
  { x: 90, y: 18, size: 2, opacity: 0.12 },
  { x: 37, y: 88, size: 1.5, opacity: 0.09 },
  { x: 57, y: 92, size: 2, opacity: 0.11 },
  { x: 14, y: 80, size: 1.5, opacity: 0.1 },
];

const NEAR_SPECKS: Speck[] = [
  { x: 12, y: 26, size: 3, opacity: 0.2, blur: 0.5 },
  { x: 27, y: 66, size: 2.5, opacity: 0.16 },
  { x: 39, y: 14, size: 3, opacity: 0.18, blur: 0.5 },
  { x: 48, y: 52, size: 2.5, opacity: 0.22 },
  { x: 58, y: 80, size: 3, opacity: 0.16 },
  { x: 66, y: 28, size: 2.5, opacity: 0.2, blur: 0.5 },
  { x: 76, y: 58, size: 3.5, opacity: 0.15, blur: 1 },
  { x: 87, y: 36, size: 2.5, opacity: 0.18 },
  { x: 18, y: 90, size: 3, opacity: 0.14 },
  { x: 70, y: 88, size: 2.5, opacity: 0.15 },
];

const FAR_COLOR = '#e8d9bd';
const NEAR_COLOR = '#d8b183';

/* Image-space anchor (%) → viewport position that survives object-cover
   cropping at any aspect, via the --hero-ax/--hero-ay compensation vars. */
const anchor = (x: number, y: number): CSSProperties => ({
  left: `calc(50% + ${x - 50} * 1% * var(--hero-ax, 1))`,
  top: `calc(50% + ${y - 50} * 1% * var(--hero-ay, 1))`,
});

function DriftField({
  specks,
  color,
  driftClass,
}: {
  specks: Speck[];
  color: string;
  driftClass: string | undefined;
}) {
  return (
    <div className={driftClass}>
      {specks.map((speck, i) =>
        /* each speck twice — y and y+50% of the 200% field — so the
           -50% translate loop is seamless */
        [speck.y / 2, speck.y / 2 + 50].map((top) => (
          <span
            key={`${i}-${top}`}
            className={styles.speck}
            style={{
              left: `${speck.x}%`,
              top: `${top}%`,
              width: speck.size,
              height: speck.size,
              opacity: speck.opacity,
              backgroundColor: color,
              filter: speck.blur ? `blur(${speck.blur}px)` : undefined,
            }}
          />
        )),
      )}
    </div>
  );
}

export function HeroLightField({ cinematic = false }: { cinematic?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  useHeroPointer(hostRef);
  useHeroSceneProgress(hostRef, cinematic);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
    >
      {/* candles wake with the scroll story (40% presence at rest) */}
      {cinematic ? (
        <div
          className="absolute inset-0"
          style={{ opacity: 'calc(0.4 + var(--hero-wake, 0) * 0.6)' }}
        >
          <div className={styles.candleHalo} style={anchor(8.5, 9)} />
          <div className={`${styles.flame} ${styles.flameA}`} style={anchor(3.2, 8.5)} />
          <div className={`${styles.flame} ${styles.flameB}`} style={anchor(13.5, 7.5)} />
        </div>
      ) : null}

      {/* the promise glow, brightening as the light wakes */}
      <div
        className="absolute inset-0"
        style={cinematic ? { opacity: 'calc(0.75 + var(--hero-wake, 0) * 0.25)' } : undefined}
      >
        <div className={styles.glow} />
      </div>

      <div className={styles.bloom} />

      {/* silk sheen — candlelight travelling across the veil */}
      {cinematic ? (
        <div className={styles.sheenMask}>
          <div className={styles.sheenBand} />
        </div>
      ) : null}

      {/* gold dust, thickening at the touch */}
      <div
        className="absolute inset-0"
        style={cinematic ? { opacity: 'calc(0.65 + var(--hero-touch, 0) * 0.35)' } : undefined}
      >
        <div className={styles.dustFar}>
          <DriftField specks={FAR_SPECKS} color={FAR_COLOR} driftClass={styles.driftFar} />
        </div>
        <div className={styles.dustNear}>
          <DriftField specks={NEAR_SPECKS} color={NEAR_COLOR} driftClass={styles.driftNear} />
        </div>
      </div>

      {/* the ring and the touch bead catch the light only at the moment */}
      {cinematic ? (
        <>
          <div
            className={styles.glintWrap}
            style={{ ...anchor(34, 47), opacity: 'var(--hero-touch, 0)' }}
          >
            <div className={styles.glintCore} />
            <div className={styles.glintFlare} />
          </div>
          <div
            className={`${styles.glintWrap} ${styles.glintSmall}`}
            style={{ ...anchor(48.5, 45.5), opacity: 'var(--hero-touch, 0)' }}
          >
            <div className={styles.glintCore} />
            <div className={styles.glintFlare} />
          </div>
        </>
      ) : null}

      {/* the promise deepens: grade + vignette ride --hero-rich */}
      {cinematic ? (
        <>
          <div className={styles.grade} style={{ opacity: 'calc(var(--hero-rich, 0) * 0.55)' }} />
          <div
            className={styles.vignette}
            style={{ opacity: 'calc(var(--hero-rich, 0) * 0.8)' }}
          />
          <div className={styles.colorBreath} />
        </>
      ) : null}

      <div className={styles.grain} />
    </div>
  );
}
