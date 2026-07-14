import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Rezervasyon Detayı' };

export default async function Page({
  params,
}: {
  params: Promise<{ 'reservation-number': string }>;
}) {
  await requireUser('/hesap/rezervasyonlar');
  const { 'reservation-number': number } = await params;
  return (
    <AccountStaged
      title="Rezervasyon Detayı"
      lead={`${number} numaralı rezervasyonunuzun ayrıntıları burada toplanacak.`}
      value={[
        'Hizmet tarihi, konum ve kapsam bilgileri',
        'Süreç adımları ve sıradaki eylem',
        'Ön ödeme ve belge durumu',
      ]}
      statusNote="Bu rezervasyonun ayrıntıları hesabınıza bağlandığında burada görünecek. Bu arada rezervasyon ekibimize doğrudan yazabilirsiniz."
      actions={[{ label: 'Tüm rezervasyonlarım', href: `${ROUTES.hesap}/rezervasyonlar` }]}
    />
  );
}
