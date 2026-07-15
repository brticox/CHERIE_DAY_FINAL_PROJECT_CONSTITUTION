import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Tekliflerim' };

export default async function Page() {
  await requireUser('/hesap/tekliflerim');
  return (
    <AccountStaged
      title="Tekliflerim"
      lead="Teklif istediğiniz özel işlerin durumunu ve size hazırlanan önerileri tek yerden takip edin."
      value={[
        'Gönderdiğiniz teklif taleplerinin durumu',
        'Size hazırlanan öneri ve fiyatları görüntüleme',
        'Onayladığınız teklifi sürece dönüştürme',
      ]}
      statusNote="Teklif akışınız hesabınıza bağlandığında burada görünecek. Yeni bir iş için hemen teklif isteyebilirsiniz."
      actions={[
        { label: 'Teklif Al', href: ROUTES.teklif },
        { label: 'Hizmetleri incele', href: ROUTES.hizmetler },
      ]}
    />
  );
}
