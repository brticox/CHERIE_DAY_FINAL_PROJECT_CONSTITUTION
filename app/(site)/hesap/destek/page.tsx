import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Destek' };

export default function Page() {
  return <PagePlaceholder title="Destek" eyebrow="Hesabım" />;
}
