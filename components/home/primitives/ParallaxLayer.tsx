import { cn } from '@/lib/utils';

/**
 * ParallaxLayer — pure-CSS depth plane.
 *
 * Reads the ancestor CursorField's `--mx`/`--my` (unitless, -1..1) and
 * displaces itself proportionally to `depth` (px at full cursor throw).
 * Server-renderable: no JS per layer, transform is a CSS calc().
 *
 * Depth classes (pre-production lock §7):
 *   far ±3 · mid ±6–8 · near ±10–14 · hands ±5 · ring ±2
 */
export function ParallaxLayer({
  depth,
  className,
  children,
  'aria-hidden': ariaHidden,
}: {
  /** Max displacement in px at full cursor throw (sign flips direction). */
  depth: number;
  className?: string;
  children?: React.ReactNode;
  'aria-hidden'?: boolean;
}) {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn('will-change-transform', className)}
      style={{
        transform: `translate3d(calc(var(--mx, 0) * ${depth}px), calc(var(--my, 0) * ${depth * 0.75}px), 0)`,
      }}
    >
      {children}
    </div>
  );
}
