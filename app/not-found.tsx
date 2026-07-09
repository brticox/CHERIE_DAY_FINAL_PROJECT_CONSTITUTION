import type { Metadata } from 'next';
import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı',
  robots: { index: false },
};

/** Global 404 (docs/44 §1). Turkish copy, always offers a path forward. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-cherie-brass">404</p>
      <h1 className="mt-4 text-h1 text-cherie-ink">Aradığınız sayfayı bulamadık</h1>
      <p className="mt-4 max-w-md text-cherie-soft-ink">
        Aradığınız sayfayı bulamadık. Dilerseniz mağazamıza göz atabilirsiniz.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={ROUTES.magaza}>Mağazaya Dön</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={ROUTES.home}>Ana Sayfa</Link>
        </Button>
      </div>
    </div>
  );
}
