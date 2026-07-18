import { legalDocuments as seedLegal } from '@/content/seed/legal';
import type { Json } from '@/lib/supabase/database.types';
import { allowLocalSeedFallback, readOnePublic, readPublic } from './source';
import type { LegalDocument } from './types';

type LegalPublicRow = {
  slug: string | null;
  doc_key: string | null;
  title_tr: string | null;
  body: Json | null;
  effective_from: string | null;
};

function legalBodyText(body: Json | null): string {
  if (typeof body === 'string') return body;
  if (!body || Array.isArray(body) || typeof body !== 'object') return '';

  for (const key of ['content', 'text', 'body']) {
    const value = body[key];
    if (typeof value === 'string') return value;
  }

  const sections = body.sections;
  if (!Array.isArray(sections)) return '';
  return sections
    .flatMap((section) => {
      if (typeof section === 'string') return [section];
      if (!section || Array.isArray(section) || typeof section !== 'object') return [];
      return ['heading', 'title', 'content', 'text']
        .map((key) => section[key])
        .filter((value): value is string => typeof value === 'string');
    })
    .join('\n\n');
}

function mapLegalRow(row: LegalPublicRow): LegalDocument | null {
  const body = legalBodyText(row.body);
  if (!row.slug || !row.doc_key || !row.title_tr || !body) return null;
  return {
    slug: row.slug,
    doc_key: row.doc_key,
    title_tr: row.title_tr,
    body_tr: body,
    needs_lawyer_review: false,
    effective_from: row.effective_from,
    publication_state: 'published',
  };
}

/** Public legal copy comes only from the approved/current public projection. */
export async function getLegalDocuments(): Promise<LegalDocument[]> {
  const rows = await readPublic<LegalPublicRow>('legal_documents_public', [], {
    order: 'title_tr',
  });
  const documents = rows.flatMap((row) => {
    const document = mapLegalRow(row);
    return document ? [document] : [];
  });
  return documents.length || !allowLocalSeedFallback() ? documents : seedLegal;
}

export async function getLegalDocumentBySlug(slug: string): Promise<LegalDocument | null> {
  const row = await readOnePublic<LegalPublicRow>(
    'legal_documents_public',
    'slug',
    slug,
    () => undefined,
  );
  const document = row ? mapLegalRow(row) : null;
  if (document || !allowLocalSeedFallback()) return document;
  return seedLegal.find((item) => item.slug === slug) ?? null;
}
