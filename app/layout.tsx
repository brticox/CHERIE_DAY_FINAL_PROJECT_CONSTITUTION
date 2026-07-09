import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

import '@/styles/globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'], // latin-ext covers Turkish glyphs (ç ş ı ğ ö ü)
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const ui = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-ui',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CHERIE DAY — Düğün, Hediye ve Kutlama Maison’u',
    template: '%s · CHERIE DAY',
  },
  description:
    'CHERIE DAY; davetiye, dijital davetiye, hediyelik, nişan & söz, organizasyon ve şehir hizmetleriyle Türkiye’ye özel lüks kutlama maison’u.',
  applicationName: 'CHERIE DAY',
  icons: { icon: '/brand/CDD.svg' },
};

export const viewport: Viewport = {
  themeColor: '#faf7f1',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${display.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
