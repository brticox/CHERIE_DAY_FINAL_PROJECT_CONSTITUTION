import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Misafir Listesi' };

export default function Page() {
  return <PagePlaceholder title="Misafir Listesi" eyebrow="Dijital" />;
}
