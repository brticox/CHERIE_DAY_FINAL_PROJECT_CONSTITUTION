import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Bütçe Rehberi' };

export default function Page() {
  return <PagePlaceholder title="Bütçe Rehberi" eyebrow="Planlama" />;
}
