import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Ödeme Bekleniyor' };

export default function Page() {
  return <PagePlaceholder title="Ödeme Bekleniyor" eyebrow="Ödeme" />;
}
