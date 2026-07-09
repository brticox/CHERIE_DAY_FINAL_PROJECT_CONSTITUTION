'use client';

import { useEffect, useRef } from 'react';

/**
 * CursorField — the single mouse listener for the homepage's 2.5D depth.
 *
 * Writes lerp-smoothed, normalized cursor coordinates (-1..1) into the CSS
 * custom properties `--mx` / `--my` on its own wrapper. All parallax layers
 * consume the vars with per-depth multipliers via pure CSS `calc()` — zero
 * per-layer JS, zero React re-renders (the Shopify-mirror jitter system,
 * rebuilt as one writer + CSS readers).
 *
 * Disabled automatically on coarse pointers and `prefers-reduced-motion`,
 * leaving the vars at 0 so every layer renders static.
 */
export function CursorField({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let running = false;

    const LERP = 0.07;

    const tick = () => {
      x += (targetX - x) * LERP;
      y += (targetY - y) * LERP;
      el.style.setProperty('--mx', x.toFixed(4));
      el.style.setProperty('--my', y.toFixed(4));
      if (Math.abs(targetX - x) > 0.001 || Math.abs(targetY - y) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} style={{ '--mx': 0, '--my': 0 } as React.CSSProperties}>
      {children}
    </div>
  );
}
