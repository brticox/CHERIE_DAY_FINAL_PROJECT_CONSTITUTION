'use client';

import { useEffect, type RefObject } from 'react';

/**
 * useDeviceTilt — gyroscope → CSS-var bridge for mobile hero depth.
 *
 * Writes two unitless, lerp-smoothed vars onto the [data-hero-runway]
 * ancestor every animation frame when a gyroscope is available:
 *
 *   --hero-tilt-x   ∈ [-1, 1]  (gamma: left-right device tilt)
 *   --hero-tilt-y   ∈ [-1, 1]  (beta:  front-back device tilt)
 *
 * These vars drive different parallax amplitudes on each mobile light
 * layer, creating a genuine 2.5-D depth effect from the gyroscope alone —
 * no canvas, no WebGL, no heavy library.
 *
 * Permission model:
 *   • iOS 13+ requires explicit permission (DeviceOrientationEvent.requestPermission).
 *     We request it on the user's first touchstart, keeping the experience
 *     gate-free on initial paint.
 *   • Android / older iOS: no permission needed — starts immediately.
 *   • No gyroscope or permission denied: vars stay unset, CSS degrades to
 *     pure animation-only (zero layout shift, no flicker).
 *
 * Gates: max-width < 1024 px · prefers-reduced-motion: no-preference.
 * Deactivates instantly if the viewport crosses 1024 px (e.g. tablet rotate).
 */

const LERP         = 0.08;
const SETTLE       = 0.0008;
/** Device tilt range that maps to ±1 (degrees). */
const GAMMA_RANGE  = 22; // left/right
const BETA_OFFSET  = 45; // typical natural hold angle
const BETA_RANGE   = 18; // front/back

export function useDeviceTilt(hostRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const runway = host.closest<HTMLElement>('[data-hero-runway]');
    if (!runway) return;

    // ── Gates ──────────────────────────────────────────────────────────
    const mqWide   = window.matchMedia('(min-width: 1024px)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: no-preference)');

    if (mqWide.matches || !mqMotion.matches) return;

    // ── State ──────────────────────────────────────────────────────────
    let targetX  = 0, targetY  = 0;
    let currentX = 0, currentY = 0;
    let raf = 0, running = false;
    let active  = false;

    // ── rAF lerp tick ─────────────────────────────────────────────────
    const tick = () => {
      currentX += (targetX - currentX) * LERP;
      currentY += (targetY - currentY) * LERP;

      if (Math.abs(targetX - currentX) < SETTLE) currentX = targetX;
      if (Math.abs(targetY - currentY) < SETTLE) currentY = targetY;

      runway.style.setProperty('--hero-tilt-x', currentX.toFixed(4));
      runway.style.setProperty('--hero-tilt-y', currentY.toFixed(4));

      if (currentX === targetX && currentY === targetY) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!running) { running = true; raf = requestAnimationFrame(tick); }
    };

    // ── Sensor handler ────────────────────────────────────────────────
    const onOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0;
      const beta  = e.beta  ?? BETA_OFFSET;

      targetX = Math.max(-1, Math.min(1, gamma / GAMMA_RANGE));
      targetY = Math.max(-1, Math.min(1, (beta - BETA_OFFSET) / BETA_RANGE));
      wake();
    };

    const startListening = () => {
      if (active) return;
      active = true;
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
    };

    // ── iOS 13+ permission ─────────────────────────────────────────────
    const requestPermission = async () => {
      type DOEWithPerm = typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
      };
      const DOE = DeviceOrientationEvent as DOEWithPerm;
      if (typeof DOE.requestPermission === 'function') {
        try {
          const perm = await DOE.requestPermission();
          if (perm === 'granted') startListening();
        } catch {
          // User denied or browser unsupported — degrade gracefully
        }
      } else {
        // Android or older iOS — no permission gate
        startListening();
      }
    };

    // Try to start without permission first (works on Android / older iOS).
    // On iOS 13+ this is a no-op until permission is granted.
    startListening();

    // On the first touch, request iOS permission.
    const onFirstTouch = () => { requestPermission(); };
    window.addEventListener('touchstart', onFirstTouch, { once: true, passive: true });

    // ── Gate reactivity — deactivate if viewport becomes desktop ──────
    const onWidthChange = () => {
      if (mqWide.matches) {
        window.removeEventListener('deviceorientation', onOrientation);
        cancelAnimationFrame(raf);
        running = false;
        active  = false;
        runway.style.removeProperty('--hero-tilt-x');
        runway.style.removeProperty('--hero-tilt-y');
      }
    };
    mqWide.addEventListener('change', onWidthChange);

    return () => {
      mqWide.removeEventListener('change', onWidthChange);
      window.removeEventListener('deviceorientation', onOrientation);
      window.removeEventListener('touchstart', onFirstTouch);
      cancelAnimationFrame(raf);
      runway.style.removeProperty('--hero-tilt-x');
      runway.style.removeProperty('--hero-tilt-y');
    };
  }, [hostRef]);
}
