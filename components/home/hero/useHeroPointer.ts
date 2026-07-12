'use client';

import { useEffect, type RefObject } from 'react';

/**
 * useHeroPointer — pointer→CSS-var bridge for the hero motion layer.
 *
 * Writes two unitless, normalized variables onto the `[data-hero-runway]`
 * ancestor every animation frame:
 *
 *   --hero-pointer-x / --hero-pointer-y  ∈ [-1, 1], lerp-smoothed
 *   --hero-para-s                        1.03 while active (poster overscan)
 *
 * Consumers derive their own amplitudes in CSS via
 * `calc(var(--hero-pointer-x, 0) * <length>)`, so every layer can move at
 * a different rate off one shared signal. Defaults keep SSR/no-JS/reduced
 * output byte-identical to the static poster.
 *
 * Gates: pointer: fine · min-width: 1024px · no prefers-reduced-motion.
 * Gates are live — resizing across 1024px or toggling reduced motion
 * activates/deactivates the system and clears the vars, so the mobile
 * poster never inherits a stale desktop transform.
 *
 * The rAF loop self-suspends when the smoothed value settles and while the
 * hero is off-screen (IntersectionObserver); pointer movement wakes it.
 * On pointer leave the target returns to center, so the light drifts home.
 */
export function useHeroPointer(hostRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const runway = host.closest<HTMLElement>('[data-hero-runway]');
    if (!runway) return;

    const gates = [
      window.matchMedia('(pointer: fine)'),
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(prefers-reduced-motion: no-preference)'),
    ];
    const gatesPass = () => gates.every((g) => g.matches);

    const LERP = 0.055;
    const SETTLE = 0.0005;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;
    let running = false;
    let visible = true;
    let active = false;

    const tick = () => {
      currentX += (targetX - currentX) * LERP;
      currentY += (targetY - currentY) * LERP;
      if (Math.abs(targetX - currentX) < SETTLE) currentX = targetX;
      if (Math.abs(targetY - currentY) < SETTLE) currentY = targetY;
      runway.style.setProperty('--hero-pointer-x', currentX.toFixed(4));
      runway.style.setProperty('--hero-pointer-y', currentY.toFixed(4));
      if (!visible || (currentX === targetX && currentY === targetY)) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!running && visible && active) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    /* The pinned hero frame is viewport-sized, so viewport coordinates are
       the frame's own space — no per-move getBoundingClientRect. */
    const onPointerMove = (event: PointerEvent) => {
      targetX = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2));
      wake();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };

    const activate = () => {
      if (active) return;
      active = true;
      runway.style.setProperty('--hero-para-s', '1.03');
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onPointerLeave);
    };

    const deactivate = () => {
      if (!active) return;
      active = false;
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      cancelAnimationFrame(raf);
      running = false;
      targetX = targetY = currentX = currentY = 0;
      runway.style.removeProperty('--hero-pointer-x');
      runway.style.removeProperty('--hero-pointer-y');
      runway.style.removeProperty('--hero-para-s');
    };

    const evaluate = () => (gatesPass() ? activate() : deactivate());

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    observer.observe(host);

    gates.forEach((g) => g.addEventListener('change', evaluate));
    evaluate();

    return () => {
      gates.forEach((g) => g.removeEventListener('change', evaluate));
      observer.disconnect();
      deactivate();
    };
  }, [hostRef]);
}
