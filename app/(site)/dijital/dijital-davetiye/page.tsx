import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Dijital Davetiye' };

export default function Page() {
  return <PagePlaceholder title="Dijital Davetiye" eyebrow="Dijital" />;
}
