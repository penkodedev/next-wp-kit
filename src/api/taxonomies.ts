import { unstable_cache } from 'next/cache';
import { fetchAPI } from './client';
import type { Taxonomy, Term } from '@/types/wordpressTypes';

export async function getAllTaxonomies(): Promise<Record<string, Taxonomy> | null> {
  return await fetchAPI<Record<string, Taxonomy>>('/wp/v2/taxonomies');
}

export const getCachedTaxonomies = unstable_cache(
  async (): Promise<Record<string, Taxonomy> | null> => {
    return await fetchAPI<Record<string, Taxonomy>>('/wp/v2/taxonomies');
  },
  ['taxonomies'],
  { revalidate: 3600, tags: ['taxonomies'] }
);

export async function getTermsForTaxonomy(taxonomySlug: string): Promise<Term[] | null> {
  return await fetchAPI<Term[]>(`/wp/v2/${taxonomySlug}`);
}
