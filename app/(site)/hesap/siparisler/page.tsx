import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Siparişlerim' };

export default function Page() {
  return <PagePlaceholder title="Siparişlerim" eyebrow="Hesabım" />;
}
