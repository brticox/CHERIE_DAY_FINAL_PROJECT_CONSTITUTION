import type { Metadata } from 'next';
import Link from 'next/link';

import { requireUser } from '@/lib/auth/guards';
import { loadPreferences } from '@/lib/account/preferences';
import { getPrivacyState } from '@/lib/account/privacy';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ROUTES } from '@/lib/data/routes';
import { PreferencesForm } from '@/components/account/preferences-form';
import { PrivacyControls } from '@/components/account/privacy-controls';

export const metadata: Metadata = {
  title: 'Tercihlerim',
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requireUser('/hesap/tercihler');
  const [preferences, privacy] = await Promise.all([loadPreferences(), getPrivacyState()]);

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Hesabım', path: ROUTES.hesap },
          { name: 'Tercihlerim', path: '/hesap/tercihler' },
        ]}
      />
      <PageHeader
        eyebrow="Hesabım"
        title="Tercihlerim"
        lead="Size nasıl ulaşacağımıza ve verilerinize dair haklarınıza siz karar verin."
      />

      <div className="mt-10 space-y-10">
        <PreferencesForm notifications={preferences.notifications} />

        <PrivacyControls
          marketingConsent={privacy.marketingConsent}
          hasOrders={privacy.hasOrders}
          exportRequest={privacy.exportRequest}
          deletionRequest={privacy.deletionRequest}
        />

        <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6">
          <h2 className="font-display text-2xl text-cherie-ink">Çerez ve gizlilik</h2>
          <p className="mt-1 text-sm text-cherie-soft-ink">
            Çerez tercihlerinizi ve gizlilik metinlerimizi buradan yönetebilirsiniz.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href={`${ROUTES.kurumsal}/cerez-tercihleri`}
              className="text-sm font-medium text-cherie-burgundy hover:underline"
            >
              Çerez Tercihleri →
            </Link>
            <Link
              href={`${ROUTES.kurumsal}/gizlilik`}
              className="text-sm font-medium text-cherie-burgundy hover:underline"
            >
              Gizlilik Politikası →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
