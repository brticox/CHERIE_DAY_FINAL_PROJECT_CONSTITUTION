import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Giriş Yap' };

export default function Page() {
  return <PagePlaceholder title="Giriş Yap" eyebrow="Hesabım" />;
}
