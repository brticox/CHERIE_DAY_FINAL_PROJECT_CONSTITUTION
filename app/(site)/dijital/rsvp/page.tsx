import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';

export const metadata: Metadata = { title: 'RSVP' };

export default function Page() {
  return <PagePlaceholder title="RSVP" eyebrow="Dijital" />;
}
