import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Bir Aksaklık Oluştu' };

export default function Page() {
  return <PagePlaceholder title="Bir Aksaklık Oluştu" eyebrow="CHERIE DAY" />;
}
