import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Tekliflerim' };

export default function Page() {
  return <PagePlaceholder title="Tekliflerim" eyebrow="Hesabım" />;
}
