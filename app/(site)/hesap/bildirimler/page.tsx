import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Bildirimler' };

export default function Page() {
  return <PagePlaceholder title="Bildirimler" eyebrow="Hesabım" />;
}
