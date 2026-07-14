import type { ServiceCity } from '@/lib/data/types';
import { SectionShell } from '@/components/home/primitives/SectionShell';
import { Reveal } from '@/components/home/primitives/Reveal';
import { TurkeyMap } from '@/components/home/sections/TurkeyMap.client';

/**
 * CityAvailability — "Şehrinizde CHERIE DAY var mı?"
 * The abstract dashed-line field is replaced by a recognizable inline-SVG
 * Türkiye silhouette with interactive, keyboard-operable city nodes and a
 * 61.8 / 38.2 editorial ledger for the selected city.
 */
export function CityAvailability({ cities }: { cities: ServiceCity[] }) {
  if (!cities.length) return null;

  return (
    <SectionShell
      eyebrow="Şehir Hizmetleri"
      title="Şehrinizde CHERIE DAY var mı?"
      lede="Kurulum gerektiren hizmetlerimiz şehir şehir planlanır; ulaşım ve koşullar haritada netçe görünür."
      className="bg-cherie-paper/40"
    >
      <Reveal>
        <TurkeyMap cities={cities} />
      </Reveal>
    </SectionShell>
  );
}
