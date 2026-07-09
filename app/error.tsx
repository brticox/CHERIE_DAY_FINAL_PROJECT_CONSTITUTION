'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

/** Route-level error boundary (docs/44 §1). Turkish 500 copy + retry. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Phase 1: surface to console; wired to real logging in a later phase.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-cherie-brass">Hata</p>
      <h1 className="mt-4 text-h1 text-cherie-ink">Bir aksaklık yaşıyoruz</h1>
      <p className="mt-4 max-w-md text-cherie-soft-ink">
        Şu an bir aksaklık yaşıyoruz. Ekibimiz durumdan haberdar. Birazdan tekrar
        deneyebilirsiniz.
      </p>
      <Button onClick={reset} className="mt-8">
        Tekrar Dene
      </Button>
    </div>
  );
}
