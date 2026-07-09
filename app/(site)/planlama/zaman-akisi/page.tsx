import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Zaman Akışı' };

export default function Page() {
  return <PagePlaceholder title="Zaman Akışı" eyebrow="Planlama" />;
}
