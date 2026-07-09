import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Hesabım' };

export default function Page() {
  return <PagePlaceholder title="Hesabım" eyebrow="Hesabım" />;
}
