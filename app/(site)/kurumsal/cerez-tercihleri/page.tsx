import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { CookiePreferences } from '@/components/legal/cookie-preferences';

const SLUG = 'cerez-tercihleri';

export const metadata: Metadata = buildMetadata({
    title: 'Çerez Tercihleri',
    description: 'CHERIE DAY teknik çerez tercihlerinizi yönetin.',
    path: `${ROUTES.kurumsal}/${SLUG}`,
  });

export default function Page() {
  return (
    <article className="cherie-container max-w-3xl py-16">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Kurumsal', path: ROUTES.kurumsal },
          { name: 'Çerez Tercihleri', path: `${ROUTES.kurumsal}/${SLUG}` },
        ]}
      />
      <h1 className="text-h2 text-cherie-ink">Çerez Tercihleri</h1>
      <p className="mt-4 text-cherie-soft-ink">
        İsteğe bağlı teknik kategorileri dilediğiniz zaman açabilir veya kapatabilirsiniz.
      </p>
      <CookiePreferences />
    </article>
  );
}
