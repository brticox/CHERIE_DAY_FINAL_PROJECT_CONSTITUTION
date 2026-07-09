import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Film' };

export default function Page() {
  return <PagePlaceholder title="Film" eyebrow="Hatıra" />;
}
