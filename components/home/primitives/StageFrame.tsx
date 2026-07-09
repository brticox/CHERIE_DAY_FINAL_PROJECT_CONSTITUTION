import { cn } from '@/lib/utils';

/**
 * StageFrame — poster-first stage shell.
 *
 * Phase 2A: renders the CSS/SVG "poster" composition (children) inside a
 * dimensional container marked with `data-stage`. In later phases the same
 * frame hosts the dynamically imported R3F canvas, which mounts over the
 * poster only when WebGLGuard approves (WebGL2 ✚ motion ✚ viewport ✚ memory).
 * The poster therefore stays the LCP element forever — canvases never gate
 * first paint (Shopify-mirror fallback philosophy).
 */
export function StageFrame({
  stage,
  className,
  children,
}: {
  /** Stable stage id, e.g. "hero" | "product-worlds" | "services" | "cta-ribbon". */
  stage: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-stage={stage} className={cn('relative isolate overflow-hidden', className)}>
      {children}
    </div>
  );
}
