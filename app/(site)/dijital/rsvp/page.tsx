import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { OfferingDetail } from '@/components/content/offering-detail';

export const metadata: Metadata = buildMetadata({
  title: 'RSVP — Katılım Yanıtları | CHERIE DAY',
  description:
    'Katılım yanıtları zahmetsiz toplansın: tek tıkla yanıt, otomatik sayım ve menü tercihi. Dijital davetiye ve düğün web sitesiyle birlikte sunulur.',
  path: `${ROUTES.dijital}/rsvp`,
});

export default function RsvpPage() {
  return (
    <OfferingDetail
      breadcrumbs={[
        { name: 'Ana Sayfa', path: ROUTES.home },
        { name: 'Dijital', path: ROUTES.dijital },
        { name: 'RSVP', path: `${ROUTES.dijital}/rsvp` },
      ]}
      eyebrow="Dijital"
      title="Katılım yanıtları, zahmetsizce"
      lead="Misafirleriniz tek dokunuşla yanıt versin; siz sayıyı ve tercihleri sakin bir panoda görün. RSVP’yi dijital davetiye ve düğün web sitesi hizmetlerimizle birlikte sunuyoruz."
      highlights={[
        { title: 'Tek tıkla yanıt', body: 'Misafir “Geliyorum” demek için form doldurmakla uğraşmaz.' },
        { title: 'Otomatik sayım', body: 'Katılım sayısı siz uğraşmadan güncel kalır.' },
        { title: 'Menü tercihi', body: 'İsterseniz menü ya da ulaşım tercihini de sorabilirsiniz.' },
        { title: 'Nazik hatırlatma', body: 'Yanıt vermeyenlere kibar bir hatırlatma iletmek kolaylaşır.' },
      ]}
      primaryCta={{ label: 'Dijital Davetiyeye Bak', href: `${ROUTES.dijital}/dijital-davetiye` }}
      secondaryCta={{ label: 'Düğün Web Sitesini İncele', href: `${ROUTES.dijital}/dugun-web-sitesi` }}
      note="RSVP bağımsız bir ürün değil; dijital davetiye ve düğün web sitesi hizmetlerimizin bir parçası olarak sunulur."
    />
  );
}
