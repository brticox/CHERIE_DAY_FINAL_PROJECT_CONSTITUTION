import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Dijital Tasarımlarım' };

export default async function Page() {
  await requireUser('/hesap/dijital');
  return (
    <AccountStaged
      title="Dijital Tasarımlarım"
      lead="Dijital davetiye, web davetiye ve QR kartlarınıza ait bağlantıları ve dosyaları tek yerde tutun."
      value={[
        'Dijital davetiye ve web davetiye bağlantılarınız',
        'QR kart ve indirilebilir dosyalarınıza erişim',
        'Onayladığınız tasarımların güncel sürümleri',
      ]}
      statusNote="Dijital projeleriniz hesabınıza bağlandığında burada görünecek. Yeni bir dijital iş için Dijital bölümünü inceleyebilirsiniz."
      actions={[{ label: 'Dijital ürünleri gör', href: ROUTES.dijital }]}
      mailbox="support"
    />
  );
}
