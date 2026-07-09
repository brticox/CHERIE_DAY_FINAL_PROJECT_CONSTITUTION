import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Randevu Al' };

export default function Page() {
  return <PagePlaceholder title="Randevu Al" eyebrow="Planlama" />;
}
