import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { HELP_EMAILS } from '@/lib/data/help';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Bir Aksaklık Oluştu | CHERIE DAY',
    description: 'Beklenmeyen bir durum oluştu. Ne yapabileceğinizi burada anlattık.',
    path: ROUTES.home,
  }),
  robots: { index: false, follow: true },
};

export default function HataPage() {
  return (
    <div className="cherie-container flex min-h-[60vh] flex-col justify-center py-16">
      <PageHeader
        eyebrow="CHERIE DAY"
        title="Bir aksaklık oluştu"
        lead="Beklenmeyen bir durumla karşılaştık ve işleminizi tamamlayamadık. Endişelenmeyin — çoğu zaman tek bir deneme yeter."
      />

      <div className="mt-8 rounded-card-lg border border-cherie-lace bg-cherie-paper/40 p-6">
        <h2 className="text-h3 text-cherie-ink">Şimdi ne yapabilirsiniz?</h2>
        <ul className="mt-4 space-y-2 text-sm text-cherie-soft-ink">
          <li>• Sayfayı yenileyip işlemi tekrar deneyin.</li>
          <li>• Bir önceki adıma dönüp bilgileri kontrol edin.</li>
          <li>• Sorun sürerse aşağıdaki bağlantılardan bize ulaşın.</li>
        </ul>
        <p className="mt-4 text-xs text-cherie-soft-ink">
          Bir ödeme yaptıysanız ve emin değilseniz, durumu doğrulamak için{' '}
          <a
            href={`mailto:${HELP_EMAILS.payments}`}
            className="text-cherie-burgundy hover:underline"
          >
            {HELP_EMAILS.payments}
          </a>{' '}
          ile iletişime geçebilirsiniz.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href={ROUTES.home}>
            <RefreshCw className="size-4" /> Ana Sayfaya Dön
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href={ROUTES.yardim}>Yardım Merkezi</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href={ROUTES.iletisim}>İletişim</Link>
        </Button>
      </div>
    </div>
  );
}
