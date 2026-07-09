import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Teklif Al' };

export default function Page() {
  return <PagePlaceholder title="Teklif Al" eyebrow="Planlama" />;
}
