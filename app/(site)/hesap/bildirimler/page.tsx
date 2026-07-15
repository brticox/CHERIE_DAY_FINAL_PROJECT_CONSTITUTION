import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Bildirimler' };

export default async function Page() {
  await requireUser('/hesap/bildirimler');
  return (
    <AccountStaged
      title="Bildirimler"
      lead="Siparişiniz, tasarım onaylarınız ve rezervasyonlarınızla ilgili önemli güncellemeler tek bir akışta."
      value={[
        'Sipariş durumu ve kargo güncellemeleri',
        'Tasarım onayı beklendiğinde hatırlatma',
        'Rezervasyon ve teklif hareketleri',
      ]}
      statusNote="Bildirim akışınız hesabınıza bağlandığında burada görünecek. Önemli gelişmeleri ayrıca e-posta ile de paylaşıyoruz."
      actions={[{ label: 'Siparişlerime git', href: `${ROUTES.hesap}/siparisler` }]}
    />
  );
}
