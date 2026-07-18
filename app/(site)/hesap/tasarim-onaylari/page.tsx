import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Tasarım Onayları' };

export default async function Page() {
  await requireUser('/hesap/tasarim-onaylari');
  return (
    <AccountStaged
      title="Tasarım Onayları"
      lead="Kişiye özel ürünlerinizin tasarımını inceleyip onaylayın; son söz her zaman sizde."
      value={[
        'Bekleyen tasarımlarınızı görüntüleme',
        'Onaylama ya da düzeltme talep etme',
        'Onay sonrası üretim durumunu izleme',
      ]}
      statusNote="Tasarım onaylarınız hesabınıza bağlandığında burada görünecek. Kişiye özel ürünlerde üretim yalnızca onayınızdan sonra başlar."
      actions={[{ label: 'Siparişlerime git', href: `${ROUTES.hesap}/siparisler` }]}
    />
  );
}
