import { legalDocuments as seedLegal } from '@/content/seed/legal';
import type { LegalDocument } from './types';

/**
 * Legal documents. The public view (`legal_documents_public`) returns the
 * current version body as JSONB; until a live DB is wired we serve the local
 * placeholders. Every document is flagged for lawyer review (docs/22).
 */
export async function getLegalDocuments(): Promise<LegalDocument[]> {
  return seedLegal;
}

export async function getLegalDocumentBySlug(slug: string): Promise<LegalDocument | null> {
  return seedLegal.find((d) => d.slug === slug) ?? null;
}
