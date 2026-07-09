import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Sipariş Takibi' };

export default function Page() {
  return <PagePlaceholder title="Sipariş Takibi" eyebrow="CHERIE DAY" />;
}
