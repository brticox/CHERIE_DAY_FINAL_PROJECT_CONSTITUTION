import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Kontrol Listesi' };

export default function Page() {
  return <PagePlaceholder title="Kontrol Listesi" eyebrow="Planlama" />;
}
