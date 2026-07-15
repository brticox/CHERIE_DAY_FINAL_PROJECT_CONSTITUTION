import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Destek Görüşmesi' };

export default async function Page({
  params,
}: {
  params: Promise<{ 'thread-id': string }>;
}) {
  await requireUser('/hesap/destek');
  await params;
  return (
    <AccountStaged
      title="Destek Görüşmesi"
      lead="Bu görüşmenin mesajları ve ekleri, güvenli mesajlaşma alanınız hazır olduğunda burada toplanacak."
      value={[
        'Görüşmedeki tüm mesajları sırayla görme',
        'Ekleri ve paylaşılan dosyaları açma',
        'Ekibimize doğrudan yanıt yazma',
      ]}
      statusNote="Görüşme geçmişiniz hesabınıza bağlandığında burada görünecek. Bu arada yardım merkezimizden ya da e-posta ile bize ulaşabilirsiniz."
      actions={[{ label: 'Tüm destek görüşmelerim', href: `${ROUTES.hesap}/destek` }]}
    />
  );
}
