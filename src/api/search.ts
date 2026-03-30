import { fetchAPI } from './client';
import type { SearchResult } from '@/types/wordpressTypes';

/** Searches the site using a custom search endpoint. */
export async function searchSite(term: string): Promise<SearchResult[] | null> {
  if (!term) return [];

  const searchQuery = `/custom/v1/search?term=${encodeURIComponent(term)}`;
  const data = await fetchAPI<SearchResult[]>(searchQuery);
  return data || [];
}
