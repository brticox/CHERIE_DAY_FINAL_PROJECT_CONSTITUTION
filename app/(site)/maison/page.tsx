import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Feather, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

import { getServiceCities } from '@/lib/data/services';
import { buildMetadata, organizationLd } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { JsonLd } from '@/components/layout/json-ld';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildMetadata({
  title: 'Maison — CHERIE DAY Hakkında',
  description:
    'CHERIE DAY, Türkiye’ye özel bir kutlama maison’u: davetiyeden dekora, hediyeden organizasyona kadar tek bir estetik dil. Hikâyemizi ve çalışma biçimimizi keşfedin.',
  path: ROUTES.maison,
});

const PILLARS = [
  {
    Icon: Feather,
    title: 'Tek bir estetik dil',
    body: 'Davetiyenin kağıdı, masanın kartı, sahnenin ışığı — hepsi aynı sakin zevkten doğar. Detaylar birbiriyle konuşur.',
  },
  {
    Icon: ShieldCheck,
    title: 'Söz verdiğimizi yaparız',
    body: 'Fiyat sunucuda doğrulanır, üretim süresi ürün sayfasında yazar. Abartılı vaat değil; net, tutulabilir bir söz.',
  },
  {
    Icon: Sparkles,
    title: 'El işçiliğiyle, ölçülü',
    body: 'Doğal kağıt, ipek kurdele, balmumu mühür. Zarafeti gösterişte değil, dokunduğunuz malzemede arıyoruz.',
  },
];

const HOUSES = [
  {
    eyebrow: 'Ürün Evi',
    title: 'Mağaza',
    body: 'Davetiye, hediyelik, nişan ve söz ürünleri, masa detayları. Kağıda dökülen ilk sözden, misafirinize kalan hatıraya.',
    href: ROUTES.magaza,
    cta: 'Mağazayı Gez',
  },
  {
    eyebrow: 'Hizmet Evi',
    title: 'Hizmetler',
    body: 'Düğün, nişan, doğum günü ve özel davetler için konsept, dekor ve koordinasyon. Sahneyi biz kurarız, gün sizin olur.',
    href: ROUTES.hizmetler,
    cta: 'Hizmetleri İncele',
  },
];

export default async function MaisonPage() {
  const cities = await getServiceCities();

  return (
    <div className="cherie-page-glow cherie-container py-14 md:py-20">
      <JsonLd data={organizationLd()} />
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Maison', path: ROUTES.maison },
        ]}
      />
      <PageHeader
        eyebrow="CHERIE DAY"
        title="Bir kutlamayı, size benzeyen bir hikâyeye dönüştürüyoruz"
        lead="CHERIE DAY, Türkiye’ye özel bir kutlama maison’u. İlk davetiyeden son teşekküre kadar her detayı tek bir sakin zevkle kuruyoruz — telaşı biz üstleniyoruz, gün size kalıyor."
      />

      {/* Two houses */}
      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {HOUSES.map((house) => (
          <Link
            key={house.href}
            href={house.href}
            className="group relative overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-ivory p-8 transition-colors duration-card ease-cherie hover:border-cherie-burgundy md:p-10"
          >
            <p className="cherie-kicker">{house.eyebrow}</p>
            <h2 className="text-h2 mt-4 text-cherie-ink group-hover:text-cherie-burgundy">
              {house.title}
            </h2>
            <p className="mt-3 max-w-md text-cherie-soft-ink">{house.body}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cherie-burgundy">
              {house.cta}
              <ArrowUpRight className="size-4 transition-transform duration-control ease-cherie group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        ))}
      </section>

      {/* Pillars */}
      <section className="mt-20">
        <p className="cherie-kicker">Nasıl bir maison?</p>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {PILLARS.map(({ Icon, title, body }) => (
            <div key={title}>
              <span className="grid size-11 place-items-center rounded-full border border-cherie-lace bg-cherie-paper/60 text-cherie-brass">
                <Icon className="size-5" strokeWidth={1.6} />
              </span>
              <h3 className="mt-4 text-h3 text-cherie-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cities */}
      <section className="mt-20 rounded-card-lg border border-cherie-lace bg-cherie-paper/40 p-8 md:p-10">
        <div className="flex items-center gap-2 text-cherie-brass">
          <MapPin className="size-4" strokeWidth={1.8} />
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
            Hizmet verdiğimiz şehirler
          </p>
        </div>
        <h2 className="text-h2 mt-4 max-w-2xl text-cherie-ink">
          İstanbul’dan başladık; kutlamanın olduğu her yere gidiyoruz
        </h2>
        <p className="mt-3 max-w-2xl text-cherie-soft-ink">
          Ürünlerimizi Türkiye geneline gönderiyoruz. Organizasyon ve kurulum
          hizmetleri ise aşağıdaki şehirlerde sunuluyor; şehir dışı için ulaşım
          koşulları teklifle netleşir.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {cities.map((city) => (
            <li key={city.id}>
              <Link
                href={`${ROUTES.hizmetlerSehir}/${city.city_slug}`}
                className="inline-flex items-center rounded-full border border-cherie-lace bg-cherie-ivory px-4 py-1.5 text-sm text-cherie-soft-ink transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-burgundy"
              >
                {city.city_name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Close */}
      <section className="mt-20 flex flex-col items-start gap-6 border-t border-cherie-lace pt-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-h2 text-cherie-ink">Nereden başlayacağınızı birlikte bulalım</h2>
          <p className="mt-2 text-cherie-soft-ink">
            Aklınızdaki günü anlatın; size uygun ürün ve hizmetlerle sakin bir
            başlangıç kuralım.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={`${ROUTES.planlama}/hayalini-tasarla`}>Hayalini Tasarla</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={ROUTES.maisonNasilCalisir}>Nasıl Çalışır?</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
