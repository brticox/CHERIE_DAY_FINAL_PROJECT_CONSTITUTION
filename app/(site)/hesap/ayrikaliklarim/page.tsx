import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { requireUser } from '@/lib/auth/guards';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/data/routes';

export const metadata: Metadata = {
  title: 'Ayrıcalıklarım',
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requireUser('/hesap/ayrikaliklarim');

  // There is no customer-scoped offer data model yet, and admin coupons /
  // campaign drafts are deliberately NOT surfaced here — showing them would
  // either expose internal data or imply a benefit the customer cannot redeem.
  // Until a real, per-customer benefit exists, this stays an honest, refined
  // recognition of the private-client relationship rather than a fake offer.
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Hesabım', path: ROUTES.hesap },
          { name: 'Ayrıcalıklarım', path: '/hesap/ayrikaliklarim' },
        ]}
      />
      <PageHeader
        eyebrow="Hesabım"
        title="Ayrıcalıklarım"
        lead="Maison ile kurduğunuz bağın size özel karşılıkları burada toplanır."
      />

      <div className="mt-10 rounded-card-lg border border-cherie-lace bg-cherie-ivory px-6 py-16 text-center">
        <Sparkles className="mx-auto size-6 text-cherie-brass" strokeWidth={1.6} />
        <h2 className="mt-4 font-display text-3xl text-cherie-ink">
          Şu an size tanımlı bir ayrıcalık yok
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-cherie-soft-ink">
          Size özel bir jest, davet ya da atölye avantajı hazırlandığında burada,
          yalnızca sizin için görünür olacak. Sürprizlerimizi sessizce ve zamanı
          geldiğinde paylaşmayı seviyoruz.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={ROUTES.magaza}>Mağazayı keşfedin</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={ROUTES.hesap}>Salonuma dön</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
