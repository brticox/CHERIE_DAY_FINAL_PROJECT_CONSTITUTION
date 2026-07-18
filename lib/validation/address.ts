import { z } from 'zod';

const requiredText = (label: string, max: number) =>
  z.string().trim().min(2, `${label} alanını doldurun.`).max(max, `${label} çok uzun.`);

/**
 * Light, safe normalization for Turkish phone numbers: keep a leading + and
 * digits only, collapse separators. Never throws; returns the trimmed input if
 * nothing digit-like is present so validation (not normalization) reports the
 * problem.
 */
export function normalizeTrPhone(input: string): string {
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d]/g, '');
  if (!digits) return trimmed;
  return hasPlus ? `+${digits}` : digits;
}

export const addressSchema = z.object({
  label: z.string().trim().max(60, 'Başlık çok uzun.').optional().or(z.literal('')),
  fullName: requiredText('Ad soyad', 100),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9()\s-]{7,24}$/, 'Geçerli bir telefon numarası girin.'),
  city: requiredText('İl', 80),
  district: requiredText('İlçe', 80),
  neighborhood: z.string().trim().max(100).optional().or(z.literal('')),
  addressLine: requiredText('Açık adres', 300),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalıdır.')
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().max(280, 'Not çok uzun.').optional().or(z.literal('')),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export type AddressActionState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const INITIAL_ADDRESS_STATE: AddressActionState = { status: 'idle' };
