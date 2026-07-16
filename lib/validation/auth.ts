import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'E-posta adresinizi girin.')
  .email('Geçerli bir e-posta adresi girin.')
  .max(160, 'E-posta adresi çok uzun.');

const password = z
  .string()
  .min(12, 'Şifreniz en az 12 karakter olmalı.')
  .max(72, 'Şifreniz en fazla 72 karakter olabilir.')
  .regex(/[a-zçğıöşü]/, 'Şifreniz en az bir küçük harf içermeli.')
  .regex(/[A-ZÇĞİÖŞÜ]/, 'Şifreniz en az bir büyük harf içermeli.')
  .regex(/[0-9]/, 'Şifreniz en az bir rakam içermeli.')
  .regex(/[^a-zA-ZÇĞİÖŞÜçğıöşü0-9]/, 'Şifreniz en az bir özel karakter içermeli.');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Şifrenizi girin.'),
  next: z.string().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Ad soyad en az 2 karakter olmalı.').max(100),
    email,
    phone: z
      .string()
      .trim()
      .max(24)
      .optional()
      .transform((value) => value || undefined)
      .refine(
        (value) => !value || /^[+0-9()\s-]{7,24}$/.test(value),
        'Geçerli bir telefon numarası girin.',
      ),
    password,
    confirmPassword: z.string(),
    consent: z
      .boolean()
      .refine((value) => value, 'Devam etmek için KVKK aydınlatmasını okuyun.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Şifreler birbiriyle eşleşmiyor.',
  });

export const forgotPasswordSchema = z.object({ email });

export const updatePasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Şifreler birbiriyle eşleşmiyor.',
  });

export type AuthActionState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const INITIAL_AUTH_STATE: AuthActionState = { status: 'idle' };

export function safeNextPath(value: string | null | undefined, fallback = '/hesap') {
  if (
    !value ||
    value.length > 500 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/\\') ||
    value.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    value.startsWith('/api/') ||
    value.startsWith('/auth/')
  ) {
    return fallback;
  }
  return value;
}
