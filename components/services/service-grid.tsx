import type { ServicePackage } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { EmptyState } from '@/components/layout/states';
import { ServiceCard } from './service-card';

export function ServiceGrid({ services }: { services: ServicePackage[] }) {
  if (services.length === 0) {
    return (
      <EmptyState
        title="Bu bölüm yakında hizmet seçenekleriyle dolacak"
        description="Dilerseniz bizimle görüşerek size özel bir kurgu oluşturabiliriz."
        ctaLabel="Bize Danışın"
        ctaHref={ROUTES.iletisim}
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <ServiceCard key={s.id} service={s} />
      ))}
    </div>
  );
}
