import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Ödeme Başarılı' };

export default function Page() {
  return <PagePlaceholder title="Ödeme Başarılı" eyebrow="Ödeme" />;
}
