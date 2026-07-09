import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Fotoğraf' };

export default function Page() {
  return <PagePlaceholder title="Fotoğraf" eyebrow="Hatıra" />;
}
