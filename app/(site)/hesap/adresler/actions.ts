'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth/guards';
import { addressSchema, type AddressActionState } from '@/lib/validation/address';
import {
  createAddress,
  deleteAddress,
  updateAddress,
} from '@/lib/addresses/server';

const ADDRESSES_PATH = '/hesap/adresler';

function parse(formData: FormData) {
  return addressSchema.safeParse({
    label: formData.get('label') ?? '',
    fullName: formData.get('fullName') ?? '',
    phone: formData.get('phone') ?? '',
    city: formData.get('city') ?? '',
    district: formData.get('district') ?? '',
    neighborhood: formData.get('neighborhood') ?? '',
    addressLine: formData.get('addressLine') ?? '',
    postalCode: formData.get('postalCode') ?? '',
    notes: formData.get('notes') ?? '',
    isDefaultShipping: formData.get('isDefaultShipping') === 'on',
    isDefaultBilling: formData.get('isDefaultBilling') === 'on',
  });
}

export async function createAddressAction(
  _previous: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  await requireUser(ADDRESSES_PATH);
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Lütfen işaretli alanları kontrol edin.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const result = await createAddress(parsed.data);
  if (!result.ok) return { status: 'error', message: result.message };
  revalidatePath(ADDRESSES_PATH);
  return { status: 'success', message: 'Adresiniz kaydedildi.' };
}

export async function updateAddressAction(
  _previous: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  await requireUser(ADDRESSES_PATH);
  const addressId = String(formData.get('addressId') ?? '');
  if (!addressId) return { status: 'error', message: 'Adres bulunamadı.' };
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Lütfen işaretli alanları kontrol edin.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const result = await updateAddress(addressId, parsed.data);
  if (!result.ok) return { status: 'error', message: result.message };
  revalidatePath(ADDRESSES_PATH);
  return { status: 'success', message: 'Adresiniz güncellendi.' };
}

export async function deleteAddressAction(formData: FormData): Promise<void> {
  await requireUser(ADDRESSES_PATH);
  const addressId = String(formData.get('addressId') ?? '');
  if (addressId) await deleteAddress(addressId);
  revalidatePath(ADDRESSES_PATH);
}
