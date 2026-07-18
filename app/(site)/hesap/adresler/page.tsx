import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { listAddresses } from '@/lib/addresses/server';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ROUTES } from '@/lib/data/routes';
import { AddressBook } from '@/components/account/address-book';

export const metadata: Metadata = {
  title: 'Adres Defterim',
  robots: { index: false, follow: false },
};

export default async function Page() {
  await requireUser('/hesap/adresler');
  const addresses = await listAddresses();
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Hesabım', path: ROUTES.hesap },
          { name: 'Adres Defterim', path: '/hesap/adresler' },
        ]}
      />
      <PageHeader
        eyebrow="Hesabım"
        title="Adres Defterim"
        lead="Teslimat ve fatura adreslerinizi bir kez kaydedin; her siparişte yeniden yazmayın."
      />
      <div className="mt-10">
        <AddressBook addresses={addresses} />
      </div>
    </div>
  );
}
