import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Dijital Tasarımlarım' };

export default function Page() {
  return <PagePlaceholder title="Dijital Tasarımlarım" eyebrow="Hesabım" />;
}
