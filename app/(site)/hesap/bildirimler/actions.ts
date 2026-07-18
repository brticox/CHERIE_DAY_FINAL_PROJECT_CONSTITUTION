'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/guards';
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/account/notifications';

const PATH = '/hesap/bildirimler';

export async function markReadAction(formData: FormData): Promise<void> {
  await requireUser(PATH);
  const id = String(formData.get('id') ?? '');
  if (id) await markNotificationRead(id);
  revalidatePath(PATH);
}

export async function markAllReadAction(): Promise<void> {
  await requireUser(PATH);
  await markAllNotificationsRead();
  revalidatePath(PATH);
}
