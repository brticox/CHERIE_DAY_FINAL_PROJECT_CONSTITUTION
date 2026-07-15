import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'Misafir Listesi Yönetimi | CHERIE DAY',
  description:
    'RSVP yanıtlarını, masa notlarını ve katılım sayısını tek yerden takip edin. Düğün web sitesi ve dijital davetiye ile birlikte sunulur.',
  path: `${ROUTES.dijital}/misafir-listesi`,
});

export default function MisafirListesiPage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Dijital', path: ROUTES.dijital },
        { name: 'Misafir Listesi', path: `${ROUTES.dijital}/misafir-listesi` },
      ]}
      eyebrow="Dijital"
      title="Misafir listeniz, tek bir sakin panoda"
      lead="Kim geliyor, kim yanıt bekliyor, hangi masada kim oturuyor — hepsini tek yerden görün. Misafir yönetimini dijital davetiye ve düğün web sitesi hizmetlerimizle birlikte sunuyoruz."
      highlights={[
        { title: 'RSVP takibi', body: 'Gelen yanıtlar tek yerde toplanır; katılım sayısı güncel kalır.' },
        { title: 'Masa & grup notları', body: 'Misafirleri gruplayın, oturma planınızı rahatça kurun.' },
        { title: 'Hatırlatma', body: 'Yanıt vermeyenlere nazik bir hatırlatma göndermek kolaylaşır.' },
        { title: 'Tek görünüm', body: 'Davetiye, web sitesi ve liste aynı hikâyeden beslenir.' },
      ]}
      primaryCta={{ label: 'Düğün Web Sitesini İncele', href: `${ROUTES.dijital}/dugun-web-sitesi` }}
      secondaryCta={{ label: 'Teklif Al', href: ROUTES.teklif }}
      note="Misafir listesi yönetimi bağımsız bir ürün değil; dijital davetiye ve düğün web sitesi hizmetlerimizle birlikte sağlanır."
    />
  );
}
