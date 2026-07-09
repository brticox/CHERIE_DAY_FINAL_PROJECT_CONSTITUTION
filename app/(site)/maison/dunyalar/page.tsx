import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Dünyalar' };

export default function Page() {
  return <PagePlaceholder title="Dünyalar" eyebrow="Maison" />;
}
