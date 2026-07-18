import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { CookieConsent } from '@/components/layout/cookie-consent';
import { CommerceAssurance } from '@/components/layout/commerce-assurance';
import { FavoritesProvider } from '@/components/commerce/favorites-provider';
import { AnalyticsPageView } from '@/components/analytics/page-view';

/** Shared chrome for all public (non-admin) surfaces. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <FavoritesProvider>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-control bg-cherie-ivory px-4 py-2 text-sm text-cherie-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="main" className="flex-1 overflow-clip">
          {children}
        </main>
        <CommerceAssurance />
        <SiteFooter />
        <CookieConsent />
        <AnalyticsPageView />
      </div>
    </FavoritesProvider>
  );
}
