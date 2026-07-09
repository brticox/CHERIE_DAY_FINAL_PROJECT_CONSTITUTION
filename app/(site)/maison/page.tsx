import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Maison' };

export default function Page() {
  return <PagePlaceholder title="Maison" eyebrow="CHERIE DAY" />;
}
