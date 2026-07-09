import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Nasıl Çalışır' };

export default function Page() {
  return <PagePlaceholder title="Nasıl Çalışır" eyebrow="Maison" />;
}
