import Image from 'next/image';
import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import { cn } from '@/lib/utils';

/**
 * Official CHERIE DAY wordmark. Uses the frozen vector at /brand/logo.svg
 * (source: assets/brand-source/logo.svg). NEVER regenerate, distort, or recolor
 * the brand marks (docs/00_AI_OPEN_FIRST §4, docs/30).
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.home}
      aria-label="CHERIE DAY ana sayfa"
      className={cn(
        'relative inline-flex h-11 w-32 shrink-0 items-center overflow-hidden',
        className,
      )}
    >
      <Image
        src="/brand/logo.svg"
        alt="CHERIE DAY"
        width={192}
        height={128}
        priority
        className="absolute left-1/2 top-1/2 h-32 w-48 max-w-none -translate-x-1/2 -translate-y-1/2"
      />
    </Link>
  );
}
