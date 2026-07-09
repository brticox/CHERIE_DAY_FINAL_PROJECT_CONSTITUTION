import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Üye Ol' };

export default function Page() {
  return <PagePlaceholder title="Üye Ol" eyebrow="Hesabım" />;
}
