import { createHash } from 'node:crypto';

import { z } from 'zod';

export const legalLifecycleStates = [
  'draft',
  'awaiting_legal_review',
  'approved',
  'published',
  'superseded',
  'archived',
] as const;

export const legalImportSchema = z.object({
  doc_key: z.string().min(2).max(80),
  locale: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/),
  version: z.string().min(1).max(40),
  title: z.string().min(2).max(200),
  summary: z.string().min(2).max(1000),
  body: z.string().min(100),
  effective_from: z.string().date().nullable(),
  source: z.object({
    author: z.string().min(2).max(160),
    reference: z.string().max(500).optional(),
    approved_at: z.string().datetime().optional(),
  }),
  lifecycle_state: z.enum(legalLifecycleStates).default('draft'),
  needs_lawyer_review: z.boolean().default(true),
});

export type LegalImport = z.infer<typeof legalImportSchema>;

export function canonicalizeLegalContent(input: LegalImport): string {
  return JSON.stringify({
    body: input.body.replace(/\r\n/g, '\n').trim(),
    doc_key: input.doc_key,
    effective_from: input.effective_from,
    locale: input.locale,
    summary: input.summary.trim(),
    title: input.title.trim(),
    version: input.version,
  });
}

export function hashLegalContent(input: LegalImport): string {
  return createHash('sha256').update(canonicalizeLegalContent(input), 'utf8').digest('hex');
}

export function validateLegalImport(value: unknown) {
  const data = legalImportSchema.parse(value);
  if (data.lifecycle_state === 'published' && data.needs_lawyer_review) {
    throw new Error('Hukuk incelemesi gereken içerik doğrudan yayımlanamaz.');
  }
  return { data, contentHash: hashLegalContent(data) };
}
