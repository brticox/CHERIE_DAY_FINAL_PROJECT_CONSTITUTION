import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { normalizeTrPhone, type AddressInput } from '@/lib/validation/address';

/**
 * Adres Defterim (customer address book) server operations.
 *
 * Every read and write goes through the cookie-bound SSR client, so RLS — the
 * table-level cust_select/insert/update_own policies (migration 0012) — is the
 * authority on ownership. No service role is used, so there is no path to
 * another customer's addresses. Default-flag reassignment and soft deletion run
 * through SECURITY INVOKER RPCs (migration 20260718090000) that are atomic and
 * still bound by the caller's RLS.
 *
 * The address book is a source for CONVENIENCE only: an order always stores an
 * immutable JSON snapshot of the address at purchase time
 * (orders.delivery_address_snapshot), so editing or deleting a saved address
 * never alters a historical order.
 */

export type CustomerAddress = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  addressLine: string | null;
  postalCode: string | null;
  notes: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export function addressesConfigured(): boolean {
  return isSupabaseConfigured();
}

type SsrClient = Awaited<ReturnType<typeof createClient>>;

async function resolveCustomerId(supabase: SsrClient): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from('customers')
    .select('id, status')
    .eq('auth_user_id', auth.user.id)
    .maybeSingle();
  if (!data || data.status !== 'active') return null;
  return String(data.id);
}

type Row = {
  id: string;
  label: string | null;
  full_name: string;
  phone: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  address_line: string | null;
  postal_code: string | null;
  notes: string | null;
  is_default_shipping: boolean;
  is_default_billing: boolean;
};

function toAddress(row: Row): CustomerAddress {
  return {
    id: row.id,
    label: row.label,
    fullName: row.full_name,
    phone: row.phone,
    city: row.city,
    district: row.district,
    neighborhood: row.neighborhood,
    addressLine: row.address_line,
    postalCode: row.postal_code,
    notes: row.notes,
    isDefaultShipping: row.is_default_shipping,
    isDefaultBilling: row.is_default_billing,
  };
}

/** Live (non-deleted) addresses for the current customer, defaults first. */
export async function listAddresses(): Promise<CustomerAddress[]> {
  if (!addressesConfigured()) return [];
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return [];
  const { data, error } = await supabase
    .from('customer_addresses')
    .select(
      'id, label, full_name, phone, city, district, neighborhood, address_line, postal_code, notes, is_default_shipping, is_default_billing, created_at',
    )
    .is('deleted_at', null)
    .order('is_default_shipping', { ascending: false })
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Row[]).map(toAddress);
}

export type AddressWriteResult =
  | { ok: true; id: string }
  | { ok: false; code: string; message: string };

const UNAVAILABLE: AddressWriteResult = {
  ok: false,
  code: 'service_unavailable',
  message: 'Adres defteri şu anda kullanılamıyor.',
};
const UNAUTHORIZED: AddressWriteResult = {
  ok: false,
  code: 'unauthorized',
  message: 'Bu işlem için giriş yapmanız gerekir.',
};

function toRow(input: AddressInput) {
  const clean = (value: string | undefined) => {
    const trimmed = (value ?? '').trim();
    return trimmed.length ? trimmed : null;
  };
  return {
    label: clean(input.label),
    full_name: input.fullName.trim(),
    phone: normalizeTrPhone(input.phone),
    country: 'TR',
    city: clean(input.city),
    district: clean(input.district),
    neighborhood: clean(input.neighborhood),
    address_line: clean(input.addressLine),
    postal_code: clean(input.postalCode),
    notes: clean(input.notes),
  };
}

async function applyDefaults(
  supabase: SsrClient,
  addressId: string,
  input: AddressInput,
): Promise<void> {
  if (input.isDefaultShipping) {
    await supabase.rpc('set_default_address', { p_address_id: addressId, p_kind: 'shipping' });
  }
  if (input.isDefaultBilling) {
    await supabase.rpc('set_default_address', { p_address_id: addressId, p_kind: 'billing' });
  }
}

export async function createAddress(input: AddressInput): Promise<AddressWriteResult> {
  if (!addressesConfigured()) return UNAVAILABLE;
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return UNAUTHORIZED;

  const { data, error } = await supabase
    .from('customer_addresses')
    .insert({ customer_id: customerId, type: 'delivery', ...toRow(input) })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, code: 'write_failed', message: 'Adres kaydedilemedi.' };
  }
  await applyDefaults(supabase, String(data.id), input);
  return { ok: true, id: String(data.id) };
}

export async function updateAddress(
  addressId: string,
  input: AddressInput,
): Promise<AddressWriteResult> {
  if (!addressesConfigured()) return UNAVAILABLE;
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return UNAUTHORIZED;

  // RLS scopes this to the caller; the explicit deleted_at guard avoids editing
  // a soft-deleted row.
  const { data, error } = await supabase
    .from('customer_addresses')
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .is('deleted_at', null)
    .select('id')
    .maybeSingle();
  if (error || !data) {
    return { ok: false, code: 'not_found', message: 'Adres bulunamadı.' };
  }
  // Clearing a default is a deliberate action; setting is handled by the RPC.
  if (!input.isDefaultShipping) {
    await supabase
      .from('customer_addresses')
      .update({ is_default_shipping: false })
      .eq('id', addressId);
  }
  if (!input.isDefaultBilling) {
    await supabase
      .from('customer_addresses')
      .update({ is_default_billing: false })
      .eq('id', addressId);
  }
  await applyDefaults(supabase, addressId, input);
  return { ok: true, id: addressId };
}

export async function deleteAddress(addressId: string): Promise<AddressWriteResult> {
  if (!addressesConfigured()) return UNAVAILABLE;
  const supabase = await createClient();
  const customerId = await resolveCustomerId(supabase);
  if (!customerId) return UNAUTHORIZED;

  const { error } = await supabase.rpc('soft_delete_address', { p_address_id: addressId });
  if (error) {
    return { ok: false, code: 'delete_failed', message: 'Adres silinemedi.' };
  }
  return { ok: true, id: addressId };
}
