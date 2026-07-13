import { BadgeCheck, Headphones, MapPin, ShieldCheck } from 'lucide-react';

const ASSURANCES = [
  {
    Icon: ShieldCheck,
    title: 'Güvenli süreç',
    text: 'Fiyat ve seçimler sunucuda doğrulanır',
  },
  {
    Icon: BadgeCheck,
    title: 'Tasarım onayı',
    text: 'Üretimden önce son söz her zaman sizin',
  },
  {
    Icon: MapPin,
    title: 'Türkiye’ye özel',
    text: 'Teslimat ve hizmet akışları yerel',
  },
  {
    Icon: Headphones,
    title: 'Maison desteği',
    text: 'Seçiminiz boyunca gerçek ekip yanınızda',
  },
] as const;

export function CommerceAssurance() {
  return (
    <section
      aria-label="CHERIE DAY güvenceleri"
      className="border-y border-cherie-lace/80 bg-cherie-ivory"
    >
      <div className="cherie-container grid divide-y divide-cherie-lace/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {ASSURANCES.map(({ Icon, title, text }) => (
          <div key={title} className="flex items-center gap-4 px-1 py-6 sm:px-6 xl:px-7">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-cherie-brass/35 bg-cherie-paper text-cherie-burgundy">
              <Icon className="size-5" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-semibold text-cherie-ink">{title}</p>
              <p className="mt-0.5 text-xs leading-5 text-cherie-soft-ink">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
