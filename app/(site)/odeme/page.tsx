import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Güvenli Ödeme' };

export default function Page() {
  return <PagePlaceholder title="Güvenli Ödeme" eyebrow="Ödeme" />;
}
