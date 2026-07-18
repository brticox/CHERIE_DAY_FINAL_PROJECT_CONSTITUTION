'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/guards';
import {
  requestAccountDeletion,
  requestDataExport,
  setMarketingConsent,
} from '@/lib/account/privacy';
import { DELETION_CONFIRM_PHRASE } from '@/lib/account/privacy-defs';

const PATH = '/hesap/tercihler';

export async function setMarketingConsentAction(formData: FormData): Promise<void> {
  await requireUser(PATH);
  await setMarketingConsent(formData.get('optIn') === 'on');
  revalidatePath(PATH);
}

export async function requestExportAction(): Promise<void> {
  await requireUser(PATH);
  await requestDataExport();
  revalidatePath(PATH);
}

export async function requestDeletionAction(formData: FormData): Promise<void> {
  await requireUser(PATH);
  // Explicit typed confirmation — the request is only filed when the customer
  // types the exact phrase, guarding against accidental submission.
  if (String(formData.get('confirm') ?? '').trim() !== DELETION_CONFIRM_PHRASE) {
    return;
  }
  await requestAccountDeletion();
  revalidatePath(PATH);
}
