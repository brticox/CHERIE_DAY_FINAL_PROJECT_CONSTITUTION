'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/guards';
import { savePreferences } from '@/lib/account/preferences';
import {
  PREFERENCE_CATEGORIES,
  PREFERENCE_CHANNELS,
  preferenceFieldName,
  type PreferencesActionState,
} from '@/lib/account/preference-defs';

const PATH = '/hesap/tercihler';

export async function savePreferencesAction(
  _previous: PreferencesActionState,
  formData: FormData,
): Promise<PreferencesActionState> {
  await requireUser(PATH);

  const notifications: Record<string, boolean> = {};
  for (const category of PREFERENCE_CATEGORIES) {
    for (const channel of PREFERENCE_CHANNELS) {
      const on = formData.get(preferenceFieldName(category.key, channel.key)) === 'on';
      notifications[`${category.key}:${channel.key}`] = on;
    }
  }
  const result = await savePreferences({ notifications });
  if (!result.ok) {
    return { status: 'error', message: result.message ?? 'Tercihleriniz kaydedilemedi.' };
  }
  revalidatePath(PATH);
  return { status: 'success', message: 'Tercihleriniz kaydedildi.' };
}
