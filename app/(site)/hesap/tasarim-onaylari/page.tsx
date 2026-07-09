import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'Tasarım Onayları' };

export default function Page() {
  return <PagePlaceholder title="Tasarım Onayları" eyebrow="Hesabım" />;
}
