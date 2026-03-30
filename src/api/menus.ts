import { unstable_cache } from 'next/cache';
import { fetchAPI, swrFetcher } from './client';
import type { MenuItem, MenuResponse, AllMenus } from '@/types/wordpressTypes';

export const getAllMenus = unstable_cache(
  async (): Promise<AllMenus | null> => {
    return await fetchAPI<AllMenus>('/custom/v1/menus');
  },
  ['all-menus'],
  { revalidate: 300, tags: ['all-menus'] }
);

export async function fetchMenuByLocation(
  location: string,
  lang: string
): Promise<MenuResponse | null> {
  return fetchAPI<MenuResponse>(`/custom/v1/menus?lang=${lang}&location=${location}`);
}

/** SWR fetcher for menu: extracts items from MenuResponse for backward compat. */
export async function menuSwrFetcher(url: string): Promise<MenuItem[]> {
  const data = await swrFetcher<MenuResponse | MenuItem[]>(url);
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}
