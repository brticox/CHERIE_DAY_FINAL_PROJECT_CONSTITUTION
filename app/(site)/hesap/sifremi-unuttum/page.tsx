import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Şifremi Unuttum' };

export default function Page() {
  return <PagePlaceholder title="Şifremi Unuttum" eyebrow="Hesabım" />;
}
