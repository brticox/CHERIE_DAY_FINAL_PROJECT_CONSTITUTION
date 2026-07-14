import type { Metadata } from 'next';

import { requireUser } from '@/lib/auth/guards';
import { ROUTES } from '@/lib/data/routes';
import { AccountStaged } from '@/components/content/account-staged';

export const metadata: Metadata = { title: 'Tercihler' };

export default async function Page() {
  await requireUser('/hesap/tercihler');
  return (
    <AccountStaged
      title="Tercihler"
      lead="İletişim ve gizlilik tercihlerinizi kendi elinizde tutun; size nasıl ulaşacağımıza siz karar verin."
      value={[
        'E-posta ve bildirim tercihlerini yönetme',
        'İlgi alanlarınıza göre öneriler alma',
        'Gizlilik ve çerez tercihlerinize kolay erişim',
      ]}
      statusNote="Tercih ayarlarınız hesabınıza bağlandığında burada görünecek. Çerez tercihlerinizi şimdiden aşağıdaki bağlantıdan güncelleyebilirsiniz."
      actions={[
        { label: 'Çerez Tercihleri', href: `${ROUTES.kurumsal}/cerez-tercihleri` },
        { label: 'Gizlilik Politikası', href: `${ROUTES.kurumsal}/gizlilik` },
      ]}
    />
  );
}
