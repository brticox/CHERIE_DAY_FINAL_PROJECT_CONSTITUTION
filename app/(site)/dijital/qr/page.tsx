import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'QR Kart' };

export default function Page() {
  return <PagePlaceholder title="QR Kart" eyebrow="Dijital" />;
}
