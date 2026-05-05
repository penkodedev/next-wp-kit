import { unstable_cache } from 'next/cache';
import { fetchAPI } from './client';
import { logger } from '@/utils/wordpress/logger';
import type { WpContent, Post, Page } from '@/types/wordpressTypes';
import localesConfig from '@/i18n/locales.generated.json';

export async function getAllPosts(params: string = ''): Promise<Post[] | null> {
  return await fetchAPI<Post[]>(`/wp/v2/posts${params}`);
}

export const getCachedAllPosts = unstable_cache(
  async (params: string = ''): Promise<Post[] | null> => {
    return await fetchAPI<Post[]>(`/wp/v2/posts${params}`);
  },
  ['all-posts'],
  { revalidate: 300, tags: ['all-posts'] }
);

export async function getAllPages(params: string = ''): Promise<Page[] | null> {
  return await fetchAPI<Page[]>(`/wp/v2/pages${params}`);
}

export async function getPage(slug: string, lang?: string): Promise<Page | null> {
  const params = slug 
    ? `?slug=${slug}${lang ? `&lang=${lang}` : ''}&_embed`
    : '';
  const pages = await fetchAPI<Page[]>(`/wp/v2/pages${params}`);
  return pages && pages.length > 0 ? pages[0] : null;
}

export const getCachedAllPages = unstable_cache(
  async (params: string = ''): Promise<Page[] | null> => {
    return await fetchAPI<Page[]>(`/wp/v2/pages${params}`);
  },
  ['all-pages'],
  { revalidate: 300, tags: ['all-pages'] }
);

/**
 * GENERIC: Fetches a collection of items from any CPT.
 * @param postType The CPT slug (e.g., 'posts', 'pages').
 * @param params Optional query string (e.g., '?per_page=10&_embed').
 */
export async function getAllContent<T extends WpContent>(postType: string, params: string = ''): Promise<T[] | null> {
  const data = await fetchAPI<T[]>(`/wp/v2/${postType}${params}`);
  return data || [];
}

/**
 * GENERIC: Fetches a content item by its slug.
 * @param postType The CPT slug (e.g., 'posts', 'pages').
 * @param slug The item's slug.
 * @param lang Optional language code (e.g., 'en') for WPML support.
 */
export async function getContentBySlug<T extends WpContent>(postType: string, slug: string, lang?: string): Promise<T | null> {
  let query = `/wp/v2/${postType}?slug=${slug}&_embed`;
  if (lang && lang !== localesConfig.defaultLocale) {
    query += `&lang=${lang}`;
  }
  const data = await fetchAPI<T[]>(query);
   
  return data?.[0] ?? null;
}

/** Fetches the home page content, with optional language support. */
export async function getHomePage(lang?: string): Promise<Page | null> {
  let query = '/wp/v2/pages?per_page=100&_embed';
   
  if (lang && lang !== localesConfig.defaultLocale) {
    query += `&lang=${lang}`;
  }
   
  const pages = await fetchAPI<Page[]>(query);
   
  if (pages && pages.length > 0) {
    // Most reliable: the front page always has '/' as its pathname in WP
    const byRootLink = pages.find(p => {
      try { return new URL(p.link).pathname === '/'; } catch { return false; }
    });
    if (byRootLink) return byRootLink;

    // Fallback: template marker
    const byTemplate = pages.find(p =>
      p.template === 'front-page' ||
      p.meta?.['_wp_page_template'] === 'front-page'
    );
    if (byTemplate) return byTemplate;

    // Fallback: common slugs
    const commonSlugs = ['inicio', 'home', 'portada', 'accueil', 'landing'];
    for (const slug of commonSlugs) {
      const page = pages.find(p => p.slug === slug);
      if (page) return page;
    }

    return pages[0];
  }
   
  return null;
}

/**
 * Safe wrapper that never throws, returns null on error.
 * Used in generateStaticParams where throwing would fail the build.
 */
export async function safeGetAllContent<T extends WpContent>(postType: string, params: string = ''): Promise<T[] | null> {
  try {
    return await getAllContent<T>(postType, params);
  } catch (error) {
    logger.error(`safeGetAllContent failed for ${postType}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}
