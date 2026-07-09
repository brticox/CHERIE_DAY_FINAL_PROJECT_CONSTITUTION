import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Düğün Web Sitesi' };

export default function Page() {
  return <PagePlaceholder title="Düğün Web Sitesi" eyebrow="Dijital" />;
}
