import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Adreslerim' };

export default async function Page() {
  await requireUser('/hesap/adresler');
  return (
    <AccountStaged
      title="Adreslerim"
      lead="Teslimat ve fatura adreslerinizi bir kez kaydedin, her siparişte tekrar yazmayın."
      value={[
        'Teslimat ve fatura adreslerinizi tek yerde saklama',
        'Sipariş sırasında kayıtlı bir adresi hızlıca seçme',
        'Adres bilgilerini istediğiniz zaman güncelleme',
      ]}
      statusNote="Adres defteriniz hesabınıza bağlandığında burada görünecek. O zamana kadar adreslerinizi ödeme adımında güvenle girebilirsiniz."
      actions={[{ label: 'Mağazaya göz at', href: ROUTES.magaza }]}
    />
  );
}
