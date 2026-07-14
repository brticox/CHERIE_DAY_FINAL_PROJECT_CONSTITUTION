import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Favorilerim' };

export default async function Page() {
  await requireUser('/hesap/favoriler');
  return (
    <AccountStaged
      title="Favorilerim"
      lead="Beğendiğiniz ürünleri bir kenara ayırın; karar vermeye hazır olduğunuzda hepsi burada olsun."
      value={[
        'Beğendiğiniz ürünleri favorilere ekleme',
        'Seçimlerinizi karşılaştırıp sonra karar verme',
        'Favorilerinizi doğrudan Seçimlerim’e taşıma',
      ]}
      statusNote="Favori listeniz hesabınıza bağlandığında burada görünecek. Şimdilik beğendiklerinizi Seçimlerim’e ekleyerek bir arada tutabilirsiniz."
      actions={[
        { label: 'Mağazayı gez', href: ROUTES.magaza },
        { label: 'Seçimlerim', href: ROUTES.secilimlerim },
      ]}
    />
  );
}
