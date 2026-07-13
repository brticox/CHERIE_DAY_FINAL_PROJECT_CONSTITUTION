import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth/guards';

export const metadata: Metadata = { title: 'Sipariş Takibi' };

export default async function Page() {
  await requireUser('/siparis-takip');
  redirect('/hesap/siparisler');
}
