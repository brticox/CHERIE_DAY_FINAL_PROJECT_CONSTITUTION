import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Değerlendirmelerim' };

export default function Page() {
  return <PagePlaceholder title="Değerlendirmelerim" eyebrow="Hesabım" />;
}
