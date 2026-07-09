import type { Metadata } from 'next';

/**
 * Lab route group — a clean stage without the site chrome (no header, footer,
 * or cookie consent). Workshop-only surfaces; never indexed.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LabLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-dvh bg-cherie-ivory">{children}</div>;
}
