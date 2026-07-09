import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Etkinlik Filmi' };

export default function Page() {
  return <PagePlaceholder title="Etkinlik Filmi" eyebrow="Hatıra" />;
}
