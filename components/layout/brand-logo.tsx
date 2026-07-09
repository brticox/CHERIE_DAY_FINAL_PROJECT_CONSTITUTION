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
      className={cn('inline-flex items-center', className)}
    >
      <Image
        src="/brand/logo.svg"
        alt="CHERIE DAY"
        width={150}
        height={40}
        priority
        className="h-8 w-auto"
      />
    </Link>
  );
}
