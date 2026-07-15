'use client';

import { useRef, type CSSProperties } from 'react';

import { useHeroPointer }       from './useHeroPointer';
import { useHeroSceneProgress } from './useHeroSceneProgress';
import { useDeviceTilt }        from './useDeviceTilt';
import styles from './HeroLightField.module.css';

/**
 * HeroLightField — cinematic atmosphere layer for the new HERO artwork.
 *
 * Desktop (≥1024 px · fine pointer):
 *   CSS-only light stack driven by two var systems written on the runway:
 *     --hero-pointer-x/y  (useHeroPointer)       — light direction + parallax
 *     --hero-wake/touch/rich (useHeroSceneProgress) — scroll story
 *     --hero-ax/ay        (useHeroSceneProgress)  — object-cover crop compensation
 *
 * Mobile (<1024 px):
 *   Self-contained CSS atmosphere positioned to the new MOBILE.png composition.
 *   Depth driven by --hero-tilt-x/y (useDeviceTilt → gyroscope), with each
 *   layer moving at a different amplitude for genuine 2.5-D depth.
 *   Falls back to pure CSS animation if no gyroscope.
 *
 * MOBILE.png anchor reference (image space %):
 *   Sky/arch glow          : 50% / 18%   (far — wide luminous arch)
 *   Touch-point burst      : 50% / 42%   (main promise light)
 *   Candle A (tall)        : 12% / 53%   (left candelabra)
 *   Candle B (short)       : 17% / 57%
 *   Ring glint             : 52% / 49%   (between the hands)
 *   Table/bottom glow      : 50% / 84%   (golden tray reflection)
 */

/* ── Speck types ─────────────────────────────────────────────────────── */

type Speck = {
  x: number;       // % of frame width
  y: number;       // % of one drift cycle (0–100)
  size: number;    // px
  opacity: number;
  blur?: number;   // px
};

/* ── Desktop dust constellations (SSR-safe — no randomness at render) ── */

const FAR_SPECKS: Speck[] = [
  { x: 8,  y: 12, size: 2,   opacity: 0.12 },
  { x: 22, y: 58, size: 1.5, opacity: 0.10 },
  { x: 31, y: 30, size: 2,   opacity: 0.14 },
  { x: 44, y: 74, size: 1.5, opacity: 0.10 },
  { x: 52, y: 22, size: 2,   opacity: 0.12 },
  { x: 63, y: 64, size: 1.5, opacity: 0.11 },
  { x: 71, y: 38, size: 2,   opacity: 0.13 },
  { x: 83, y: 70, size: 1.5, opacity: 0.10 },
  { x: 90, y: 18, size: 2,   opacity: 0.12 },
  { x: 37, y: 88, size: 1.5, opacity: 0.09 },
  { x: 57, y: 92, size: 2,   opacity: 0.11 },
  { x: 14, y: 80, size: 1.5, opacity: 0.10 },
];

const NEAR_SPECKS: Speck[] = [
  { x: 12, y: 26, size: 3,   opacity: 0.20, blur: 0.5 },
  { x: 27, y: 66, size: 2.5, opacity: 0.16 },
  { x: 39, y: 14, size: 3,   opacity: 0.18, blur: 0.5 },
  { x: 48, y: 52, size: 2.5, opacity: 0.22 },
  { x: 58, y: 80, size: 3,   opacity: 0.16 },
  { x: 66, y: 28, size: 2.5, opacity: 0.20, blur: 0.5 },
  { x: 76, y: 58, size: 3.5, opacity: 0.15, blur: 1 },
  { x: 87, y: 36, size: 2.5, opacity: 0.18 },
  { x: 18, y: 90, size: 3,   opacity: 0.14 },
  { x: 70, y: 88, size: 2.5, opacity: 0.15 },
];

/* ── Mobile dust (around the touch-point / promise area) ─────────────── */

const MOBILE_DUST_SPECKS: Speck[] = [
  { x: 30, y: 20, size: 2.5, opacity: 0.18 },
  { x: 55, y: 60, size: 2,   opacity: 0.14 },
  { x: 68, y: 32, size: 2.5, opacity: 0.16 },
  { x: 42, y: 78, size: 2,   opacity: 0.12 },
  { x: 78, y: 66, size: 2,   opacity: 0.13 },
  { x: 20, y: 50, size: 2,   opacity: 0.12 },
  { x: 60, y: 14, size: 1.5, opacity: 0.10 },
  { x: 35, y: 42, size: 2,   opacity: 0.15 },
];

const FAR_COLOR    = '#e8d9bd';
const NEAR_COLOR   = '#d8b183';
const MOBILE_COLOR = '#d4a96a';

/* ── Desktop image-space anchor ─────────────────────────────────────── */

/**
 * Maps image-space coordinates (%) to a viewport position that survives
 * object-cover cropping at any aspect ratio, via --hero-ax/ay vars.
 *
 * HERO.png (desktop) anchor reference:
 *   Touch-point burst  : 50% / 38%
 *   Candle halo centre : 11% / 38%
 *   Candle A flame     : 10% / 36%
 *   Candle B flame     : 14% / 33%
 *   Bride's ring       : 44% / 41%
 */
const anchor = (x: number, y: number): CSSProperties => ({
  left: `calc(50% + ${x - 50} * 1% * var(--hero-ax, 1))`,
  top:  `calc(50% + ${y - 50} * 1% * var(--hero-ay, 1))`,
});

/* ── DriftField ──────────────────────────────────────────────────────── */

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
        [speck.y / 2, speck.y / 2 + 50].map((top) => (
          <span
            key={`${i}-${top}`}
            className={styles.speck}
            style={{
              left:            `${speck.x}%`,
              top:             `${top}%`,
              width:           speck.size,
              height:          speck.size,
              opacity:         speck.opacity,
              backgroundColor: color,
              filter: speck.blur ? `blur(${speck.blur}px)` : undefined,
            }}
          />
        )),
      )}
    </div>
  );
}

/* ── HeroLightField ──────────────────────────────────────────────────── */

export function HeroLightField({ cinematic = false }: { cinematic?: boolean }) {
  // Desktop host — receives pointer + scroll vars
  const desktopRef = useRef<HTMLDivElement>(null);
  useHeroPointer(desktopRef);
  useHeroSceneProgress(desktopRef, cinematic);

  // Mobile host — receives gyroscope tilt vars
  const mobileRef = useRef<HTMLDivElement>(null);
  useDeviceTilt(mobileRef);

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE LIGHT FIELD  (<1024 px)
          Self-contained gyroscope-driven depth stack positioned to the
          new MOBILE.png artwork. No pointer vars, no scroll vars.
          Each layer moves at a different tilt amplitude → 2.5-D depth.
          ════════════════════════════════════════════════════════════════ */}
      <div
        ref={mobileRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden"
      >
        {/* Far layer: sky / arch ambient glow (50% / 18%) — tilt ×4px */}
        <div className={styles.mSkyGlow} />

        {/* Mid layer: main promise glow at touch-point (50% / 42%) — tilt ×8px */}
        <div className={styles.mGlow} />

        {/* Mid layer: pulsing bloom at touch-point */}
        <div className={styles.mBloom} />

        {/* Near layer: candle warmth from left (12% / 53%) — tilt ×6px */}
        <div className={styles.mCandle} />

        {/* Near layer: candle B warmer, slightly offset (17% / 57%) */}
        <div className={styles.mCandleB} />

        {/* Nearest layer: central starburst core (50% / 42%) — tilt ×12px */}
        <div className={styles.mCore} />

        {/* Table/bottom golden glow (50% / 84%) — very near, tilt ×5px */}
        <div className={styles.mTableGlow} />

        {/* Ring glint between hands (52% / 49%) */}
        <div className={styles.mRingGlint} />

        {/* Gold dust around the promise area */}
        <div className={styles.mDust}>
          <DriftField
            specks={MOBILE_DUST_SPECKS}
            color={MOBILE_COLOR}
            driftClass={styles.driftNear}
          />
        </div>

        {/* Film grain */}
        <div className={styles.grain} />
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP LIGHT FIELD  (≥1024 px)
          Pointer-reactive + scroll-driven, positioned to HERO.png.
          ════════════════════════════════════════════════════════════════ */}
      <div
        ref={desktopRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      >
        {/* Candles — calibrated to candelabra at ~11%/38% of HERO.png */}
        {cinematic ? (
          <div
            className="absolute inset-0"
            style={{ opacity: 'calc(0.4 + var(--hero-wake, 0) * 0.6)' }}
          >
            <div className={styles.candleHalo} style={anchor(11, 38)} />
            <div className={`${styles.flame} ${styles.flameA}`} style={anchor(10, 36)} />
            <div className={`${styles.flame} ${styles.flameB}`} style={anchor(14, 33)} />
          </div>
        ) : null}

        {/* Promise glow, brightening as the light wakes */}
        <div
          className="absolute inset-0"
          style={cinematic ? { opacity: 'calc(0.75 + var(--hero-wake, 0) * 0.25)' } : undefined}
        >
          <div className={styles.glow} />
        </div>

        {/* ── Ray only appears after video fades out (p=0.65 to 0.75) ── */}
        {cinematic ? (
          <div
            className="absolute inset-0"
            style={{ opacity: 'calc((var(--hero-rich, 0) - 0.4) * 2.5)' }}
          >
            <div className={styles.ray} />
            <div className={styles.rayVertical} />
          </div>
        ) : null}

        <div className={styles.bloom} />

        {/* Silk sheen — light travelling across the ribbon/veil */}
        {cinematic ? (
          <div className={styles.sheenMask}>
            <div className={styles.sheenBand} />
          </div>
        ) : null}

        {/* Gold dust, thickening at the touch */}
        <div
          className="absolute inset-0"
          style={cinematic ? { opacity: 'calc(0.65 + var(--hero-touch, 0) * 0.35)' } : undefined}
        >
          <div className={styles.dustFar}>
            <DriftField specks={FAR_SPECKS}  color={FAR_COLOR}  driftClass={styles.driftFar} />
          </div>
          <div className={styles.dustNear}>
            <DriftField specks={NEAR_SPECKS} color={NEAR_COLOR} driftClass={styles.driftNear} />
          </div>
        </div>

        {/* Glints — bride ring ~44%/41%, touch light burst ~50%/38% */}
        {cinematic ? (
          <>
            <div
              className={styles.glintWrap}
              style={{ ...anchor(44, 41), opacity: 'var(--hero-touch, 0)' }}
            >
              <div className={styles.glintCore} />
              <div className={styles.glintFlare} />
            </div>
            <div
              className={`${styles.glintWrap} ${styles.glintSmall}`}
              style={{ ...anchor(50, 38), opacity: 'var(--hero-touch, 0)' }}
            >
              <div className={styles.glintCore} />
              <div className={styles.glintFlare} />
            </div>
          </>
        ) : null}

        {/* Promise deepens: grade + vignette ride --hero-rich */}
        {cinematic ? (
          <>
            <div className={styles.grade}    style={{ opacity: 'calc(var(--hero-rich, 0) * 0.55)' }} />
            <div className={styles.vignette} style={{ opacity: 'calc(var(--hero-rich, 0) * 0.80)' }} />
            <div className={styles.colorBreath} />
          </>
        ) : null}

        <div className={styles.grain} />
      </div>
    </>
  );
}
