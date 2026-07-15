import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Destek' };

export default async function Page() {
  await requireUser('/hesap/destek');
  return (
    <AccountStaged
      title="Destek"
      lead="CHERIE DAY ekibiyle güvenli biçimde yazışın; siparişleriniz ve projeleriniz bağlamıyla birlikte."
      value={[
        'Ekibimizle mesajlaşma geçmişinizi görme',
        'Sipariş ya da rezervasyon bağlamıyla yazışma',
        'Yanıtları hesabınızda takip etme',
      ]}
      statusNote="Güvenli mesajlaşma alanınız hesabınıza bağlandığında burada görünecek. Şimdilik yardım merkezimizden ya da e-posta ile bize ulaşabilirsiniz."
      actions={[
        { label: 'Yardım Merkezi', href: ROUTES.yardim },
        { label: 'İletişim', href: ROUTES.iletisim },
      ]}
    />
  );
}
