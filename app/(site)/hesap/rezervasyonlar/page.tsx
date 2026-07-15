import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Rezervasyonlarım' };

export default async function Page() {
  await requireUser('/hesap/rezervasyonlar');
  return (
    <AccountStaged
      title="Rezervasyonlarım"
      lead="Hizmet tarihlerinizi, süreç adımlarınızı ve ön ödeme durumunuzu tek yerden takip edin."
      value={[
        'Onaylanan hizmet tarihlerinizi görme',
        'Rezervasyon sürecinin adımlarını izleme',
        'Varsa ön ödeme (depozito) durumunu takip etme',
      ]}
      statusNote="Rezervasyon akışınız hesabınıza bağlandığında burada görünecek. Yeni bir hizmet için randevu ya da teklif isteyebilirsiniz."
      actions={[
        { label: 'Randevu Al', href: ROUTES.randevu },
        { label: 'Hizmetleri incele', href: ROUTES.hizmetler },
      ]}
    />
  );
}
