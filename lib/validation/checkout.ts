import { z } from 'zod';

const requiredText = (label: string, max: number) =>
  z.string().trim().min(2, `${label} alanını doldurun.`).max(max, `${label} çok uzun.`);

export const checkoutSchema = z
  .object({
    fullName: requiredText('Ad soyad', 100),
    phone: z
      .string()
      .trim()
      .regex(/^[+0-9()\s-]{7,24}$/, 'Geçerli bir telefon numarası girin.'),
    city: requiredText('İl', 80),
    district: requiredText('İlçe', 80),
    neighborhood: z.string().trim().max(100).optional(),
    addressLine: requiredText('Açık adres', 300),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalıdır.')
      .optional()
      .or(z.literal('')),
    shippingMethodId: z.string().uuid('Teslimat yöntemini seçin.'),
    paymentProvider: z.union([z.literal('paytr'), z.literal('')]).optional(),
    invoiceType: z.enum(['bireysel', 'kurumsal']),
    invoiceName: requiredText('Fatura adı', 160),
    identityNumber: z
      .string()
      .trim()
      .regex(/^\d{11}$/, 'T.C. kimlik numarası 11 haneli olmalıdır.')
      .optional()
      .or(z.literal('')),
    companyTitle: z.string().trim().max(180).optional(),
    taxNumber: z
      .string()
      .trim()
      .regex(/^\d{10}$/, 'Vergi numarası 10 haneli olmalıdır.')
      .optional()
      .or(z.literal('')),
    taxOffice: z.string().trim().max(100).optional(),
    proofAcknowledged: z
      .literal('on', {
        errorMap: () => ({ message: 'Tasarım onayı sürecini kabul etmelisiniz.' }),
      })
      .optional(),
    preInfoConsent: z.literal('on', {
      errorMap: () => ({ message: 'Ön Bilgilendirme Formu onayı zorunludur.' }),
    }),
    kvkkConsent: z.literal('on', {
      errorMap: () => ({ message: 'KVKK Aydınlatma Metni’ni okumalısınız.' }),
    }),
    distanceSalesConsent: z.literal('on', {
      errorMap: () => ({ message: 'Mesafeli Satış Sözleşmesi onayı zorunludur.' }),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.invoiceType === 'kurumsal') {
      if (!value.companyTitle)
        ctx.addIssue({
          code: 'custom',
          path: ['companyTitle'],
          message: 'Şirket unvanını girin.',
        });
      if (!value.taxNumber)
        ctx.addIssue({
          code: 'custom',
          path: ['taxNumber'],
          message: 'Vergi numarasını girin.',
        });
      if (!value.taxOffice)
        ctx.addIssue({
          code: 'custom',
          path: ['taxOffice'],
          message: 'Vergi dairesini girin.',
        });
    }
  });

export type CheckoutState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Record<string, string[]>;
  sessionId?: string;
  orderNumber?: string;
  paymentUrl?: string;
};
export const INITIAL_CHECKOUT_STATE: CheckoutState = { status: 'idle' };
