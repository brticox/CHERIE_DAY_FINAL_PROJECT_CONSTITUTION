import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Seçimlerim' };

export default function Page() {
  return <PagePlaceholder title="Seçimlerim" eyebrow="Sepet" />;
}
