import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Adreslerim' };

export default function Page() {
  return <PagePlaceholder title="Adreslerim" eyebrow="Hesabım" />;
}
