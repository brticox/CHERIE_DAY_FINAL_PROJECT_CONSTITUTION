'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * useScrollProgress — maps a tall pinned section's scroll travel to 0..1.
 *
 * Writes into a ref (never state) so the WebGL scene can read it inside
 * useFrame without a single React re-render — the same one-writer/many-
 * readers discipline as the CursorField.
 *
 * Phase 2B uses native scroll; the output contract (0..1 in a ref) is
 * Lenis-ready for Phase 3 and Theatre.js-ready for Phase 6, where this
 * exact value becomes `sequence.position`.
 */
export function useScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
): RefObject<number> {
  const progress = useRef(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const el = sectionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const runway = rect.height - window.innerHeight;
        progress.current =
          runway > 0 ? Math.min(1, Math.max(0, -rect.top / runway)) : 0;
      }
      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [sectionRef]);

  return progress;
}
