import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Değerlendirmelerim' };

export default async function Page() {
  await requireUser('/hesap/degerlendirmelerim');
  return (
    <AccountStaged
      title="Değerlendirmelerim"
      lead="Aldığınız ürün ve hizmetler hakkındaki görüşleriniz; başka çiftlere yol gösterir, bize ışık olur."
      value={[
        'Tamamlanan siparişleriniz için değerlendirme bırakma',
        'Paylaştığınız görüşleri tek yerden görme',
        'Yalnızca gerçek deneyimlere dayalı, doğrulanmış yorumlar',
      ]}
      statusNote="Değerlendirme alanınız hesabınıza bağlandığında burada görünecek. Yorumlar yalnızca gerçekleşen siparişlere açılır."
      actions={[{ label: 'Siparişlerime git', href: `${ROUTES.hesap}/siparisler` }]}
    />
  );
}
