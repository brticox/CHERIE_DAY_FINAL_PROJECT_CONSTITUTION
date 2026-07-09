import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Drone' };

export default function Page() {
  return <PagePlaceholder title="Drone" eyebrow="Hatıra" />;
}
