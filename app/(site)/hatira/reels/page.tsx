import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Reels' };

export default function Page() {
  return <PagePlaceholder title="Reels" eyebrow="Hatıra" />;
}
