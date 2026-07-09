import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Yeni Eklenenler' };

export default function Page() {
  return <PagePlaceholder title="Yeni Eklenenler" eyebrow="Mağaza" />;
}
