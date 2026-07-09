import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Hayalini Tasarla' };

export default function Page() {
  return <PagePlaceholder title="Hayalini Tasarla" eyebrow="Planlama" />;
}
