'use client';

import { useEffect, type RefObject } from 'react';

/**
 * useHeroSceneProgress — scroll → cinematic-timeline CSS vars.
 *
 * Maps the `[data-hero-runway]` pin travel (0..1) to three emotional
 * phases, written as unitless vars on the runway (one writer, CSS-only
 * consumers, no React re-renders — same discipline as useHeroPointer):
 *
 *   --hero-wake   0→1 across 28–50%   (the light wakes up)
 *   --hero-touch  bell: rises 44–52%, settles to 0.3 by 70%  (the touch)
 *   --hero-rich   0→1 across 50–85%   (the promise deepens)
 *
 * Also writes --hero-ax / --hero-ay — object-cover crop compensation for
 * the 16:9 poster, so image-space anchors (ring, flames) can be placed as
 * `calc(50% + <offset>% * var(--hero-ax))` and stay glued to the pixels
 * they decorate at any viewport aspect.
 *
 * Gates mirror useHeroPointer (fine pointer · ≥1024px · motion OK) and are
 * live; deactivation clears every var so the static rest state returns.
 */

const IMAGE_ASPECT = 16 / 9;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function useHeroSceneProgress(
  hostRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
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

    let raf = 0;
    let scheduled = false;
    let active = false;
    let visible = true;
    let lastWake = -1;
    let lastTouch = -1;
    let lastRich = -1;

    const applyAspect = () => {
      const viewAspect = window.innerWidth / window.innerHeight;
      const ax = viewAspect < IMAGE_ASPECT ? IMAGE_ASPECT / viewAspect : 1;
      const ay = viewAspect > IMAGE_ASPECT ? viewAspect / IMAGE_ASPECT : 1;
      runway.style.setProperty('--hero-ax', ax.toFixed(4));
      runway.style.setProperty('--hero-ay', ay.toFixed(4));
    };

    const compute = () => {
      scheduled = false;
      const rect = runway.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;

      const wake = smoothstep(0.28, 0.5, p);
      const touch =
        p <= 0.52
          ? smoothstep(0.44, 0.52, p)
          : 1 - 0.7 * smoothstep(0.52, 0.7, p);
      const rich = smoothstep(0.5, 0.85, p);

      if (Math.abs(wake - lastWake) > 0.002) {
        lastWake = wake;
        runway.style.setProperty('--hero-wake', wake.toFixed(3));
      }
      if (Math.abs(touch - lastTouch) > 0.002) {
        lastTouch = touch;
        runway.style.setProperty('--hero-touch', touch.toFixed(3));
      }
      if (Math.abs(rich - lastRich) > 0.002) {
        lastRich = rich;
        runway.style.setProperty('--hero-rich', rich.toFixed(3));
      }
    };

    const schedule = () => {
      if (!scheduled && visible && active) {
        scheduled = true;
        raf = requestAnimationFrame(compute);
      }
    };

    const onResize = () => {
      if (!active) return;
      applyAspect();
      schedule();
    };

    const activate = () => {
      if (active) return;
      active = true;
      applyAspect();
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', onResize);
      schedule();
    };

    const deactivate = () => {
      if (!active) return;
      active = false;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      scheduled = false;
      lastWake = lastTouch = lastRich = -1;
      for (const v of ['--hero-wake', '--hero-touch', '--hero-rich', '--hero-ax', '--hero-ay']) {
        runway.style.removeProperty(v);
      }
    };

    const evaluate = () => (gatesPass() ? activate() : deactivate());

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      visible = entry.isIntersecting;
      if (visible) schedule();
    });
    observer.observe(runway);

    gates.forEach((g) => g.addEventListener('change', evaluate));
    evaluate();

    return () => {
      gates.forEach((g) => g.removeEventListener('change', evaluate));
      observer.disconnect();
      deactivate();
    };
  }, [hostRef, enabled]);
}
