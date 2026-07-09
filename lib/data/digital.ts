import { digitalProducts as seedDigital } from '@/content/seed/digital';
import { readPublic } from './source';
import type { DigitalProduct } from './types';

export async function getDigitalProducts(): Promise<DigitalProduct[]> {
  return readPublic<DigitalProduct>('digital_products_public', seedDigital, { order: 'name_tr' });
}

export async function getDigitalProductBySlug(slug: string): Promise<DigitalProduct | null> {
  const all = await getDigitalProducts();
  return all.find((d) => d.slug === slug) ?? null;
}
