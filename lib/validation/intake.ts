import { z } from 'zod';

export const INTAKE_TYPES = ['contact', 'quote', 'dream', 'appointment'] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `En fazla ${max} karakter girebilirsiniz.`)
    .optional()
    .transform((value) => value || undefined);

const optionalEmail = z
  .string()
  .trim()
  .max(160, 'E-posta adresi çok uzun.')
  .optional()
  .transform((value) => value || undefined)
  .pipe(z.string().email('Geçerli bir e-posta adresi girin.').optional());

const optionalPhone = z
  .string()
  .trim()
  .max(24, 'Telefon numarası çok uzun.')
  .optional()
  .transform((value) => value || undefined)
  .refine(
    (value) => !value || /^[+0-9()\s-]{7,24}$/.test(value),
    'Geçerli bir telefon numarası girin.',
  );

export const intakeSchema = z
  .object({
    intakeType: z.enum(INTAKE_TYPES),
    name: z
      .string()
      .trim()
      .min(2, 'Ad soyad en az 2 karakter olmalı.')
      .max(100, 'Ad soyad en fazla 100 karakter olabilir.'),
    email: optionalEmail,
    phone: optionalPhone,
    inquiryType: optionalText(40),
    eventType: optionalText(80),
    eventDateOrSeason: optionalText(80),
    location: optionalText(120),
    guestCountBand: optionalText(40),
    styleNotes: optionalText(1000),
    budgetBand: z.enum(['starter', 'premium', 'luxury', 'bespoke']).optional(),
    neededModules: z.array(z.string().trim().min(1).max(50)).max(8).default([]),
    preferredDate: optionalText(40),
    preferredTime: optionalText(40),
    preferredChannel: z.enum(['online', 'phone', 'whatsapp', 'in_person']).optional(),
    mood: optionalText(160),
    collection: optionalText(100),
    message: optionalText(2000),
    sourceEntityType: z.enum(['product', 'service', 'experience', 'page']).optional(),
    sourceSlug: optionalText(160),
    sourceLabel: optionalText(180),
    sourcePath: z
      .string()
      .trim()
      .max(300)
      .optional()
      .transform((value) => value || undefined)
      .refine((value) => !value || value.startsWith('/'), 'Geçersiz kaynak yolu.'),
    consent: z
      .boolean()
      .refine((value) => value, 'Devam etmek için KVKK aydınlatmasını onaylayın.'),
    company: z.string().max(200).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.email && !value.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'E-posta veya telefon bilgilerinden en az birini girin.',
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'E-posta veya telefon bilgilerinden en az birini girin.',
      });
    }

    if (value.intakeType === 'appointment' && !value.preferredDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['preferredDate'],
        message: 'Tercih ettiğiniz tarihi seçin.',
      });
    }

    if (
      (value.intakeType === 'quote' || value.intakeType === 'dream') &&
      !value.eventType
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['eventType'],
        message: 'Kutlama türünü seçin.',
      });
    }
  });

export type IntakePayload = z.infer<typeof intakeSchema>;
export type IntakeType = (typeof INTAKE_TYPES)[number];

export type IntakeSourceContext = Pick<
  IntakePayload,
  'sourceEntityType' | 'sourceSlug' | 'sourceLabel' | 'sourcePath'
>;
