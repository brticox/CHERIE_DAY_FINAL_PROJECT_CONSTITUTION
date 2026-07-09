import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Siparişim Hakkında Yardım' };

export default function Page() {
  return <PagePlaceholder title="Siparişim Hakkında Yardım" eyebrow="Yardım" />;
}
