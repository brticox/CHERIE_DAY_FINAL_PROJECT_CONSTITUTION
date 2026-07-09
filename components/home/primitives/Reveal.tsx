'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** Locked easing (docs/25). */
const CHERIE_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Reveal — enter-triggered fade-up used by non-scrubbed sections.
 * Plays once, respects reduced motion (opacity-only), never re-triggers
 * (pre-production lock §7: motion rests so the moving moments matter).
 */
export function Reveal({
  delay = 0,
  y = 24,
  className,
  children,
}: {
  delay?: number;
  /** Vertical travel in px; ignored under reduced motion. */
  y?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: reduced ? 0.2 : 0.8, delay, ease: CHERIE_EASE }}
    >
      {children}
    </motion.div>
  );
}
