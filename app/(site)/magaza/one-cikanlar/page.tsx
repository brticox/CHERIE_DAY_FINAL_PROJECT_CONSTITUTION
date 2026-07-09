import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Öne Çıkan Seçimler' };

export default function Page() {
  return <PagePlaceholder title="Öne Çıkan Seçimler" eyebrow="Mağaza" />;
}
