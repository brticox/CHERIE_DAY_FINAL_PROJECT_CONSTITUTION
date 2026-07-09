import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Rezervasyonlarım' };

export default function Page() {
  return <PagePlaceholder title="Rezervasyonlarım" eyebrow="Hesabım" />;
}
