// src/api/wordpress.ts

import type { WpContent, SiteInfo, MenuItem, SearchResult, Page, Modal, PostNavigation, AllMenus } from '@/types/wordpressTypes';
import { unstable_cache } from 'next/cache';
import { logger } from '@/utils/logger';

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

/*--------------------------------------------------------------------------------------
    WORDPRESS API CONSUMPTION
    This file is the central place for fetching data from the WordPress REST API.
    All custom endpoints consumed here are defined in the headless theme, specifically
    in the file: /inc/api/api-endpoints.php
--------------------------------------------------------------------------------------*/

// ********************** Core Fetch API Function **********************
export async function fetchAPI<T>(
  query = '', 
  options: { 
    method?: string, 
    headers?: Record<string, string>, 
    body?: Record<string, any> | null,
    next?: NextFetchRequestConfig 
  } = {},
): Promise<T | null> {
  // Security check: if the API URL is not configured, we cannot proceed.
  if (!API_URL) {
    logger.error("NEXT_PUBLIC_WORDPRESS_API_URL environment variable is not configured.");
    return null;
  }

  const headers = { 'Content-Type': 'application/json' };
  // Safely constructs the full URL, avoiding double slashes.
  const requestUrl = `${API_URL.replace(/\/$/, '')}/${query.replace(/^\//, '')}`;
  
  try {
    const { method = 'GET', headers: customHeaders = {}, body = null, next } = options;

    const res = await fetch(requestUrl, {
      method,
      headers: {
        ...headers,
        ...customHeaders,
      },
      body: body ? JSON.stringify(body) : null,
      // Next.js cache options (cache for 5 minutes in production, no cache in development)
      next: next || { revalidate: process.env.NODE_ENV === 'production' ? 300 : 0 },
    });

    if (!res.ok) {
      // The WP search endpoint returns 404 if there are no results.
      // We treat it as a success case with an empty array instead of an error.
      if (res.status === 404 && query.includes('/wp/v2/search')) {
        return [] as T; // We return an empty array and cast it to the expected type.
      }

      // For any other error, log it and return null.
      try {
        const errorBody = await res.json();
        logger.error(`API Error for ${query}:`, errorBody);
      } catch {
        logger.error(`API Error for ${query}: ${res.status} ${res.statusText}`);
      }
      // We return null so the calling component can handle it.
      return null;
    }

    const json: T = await res.json();
    return json;
  } catch (error) {
    // If the fetch fails (e.g., WP is unavailable), we catch the error.
    logger.error(`Fetch failed for ${requestUrl}:`, error instanceof Error ? error.message : String(error));
    // We return null to prevent the app from crashing on the server.
    return null;
  }
}


/*--------------------------------------------------------------------------------------
    🍔 GET SITE INFO
    Route: /custom/v1/site-info
    e.g. /custom/v1/site-info
--------------------------------------------------------------------------------------*/
/** Fetches basic site information from a custom endpoint. */
export async function getSiteInfo(): Promise<SiteInfo | null> {
  const data = await fetchAPI<SiteInfo>('/custom/v1/site-info');
  return data;
}


/*--------------------------------------------------------------------------------------
    🍔 GET ALL CONTENT (GENERIC)
    Route: /wp/v2/{postType}{params}
    e.g. /wp/v2/posts?per_page=10&_embed
--------------------------------------------------------------------------------------*/
/**
 * GENERIC: Fetches a collection of items from any CPT.
 * @param postType The CPT slug (e.g., 'posts', 'pages').
 * @param params Optional query string (e.g., '?per_page=10&_embed').
 */
export async function getAllContent<T extends WpContent>(postType: string, params: string = ''): Promise<T[] | null> {
  const data = await fetchAPI<T[]>(`/wp/v2/${postType}${params}`);
  return data || [];
}


/*--------------------------------------------------------------------------------------
    🍔 GET CONTENT BY SLUG (GENERIC)
    Route: /wp/v2/{postType}?slug={slug}&_embed&_fields=...
    e.g. /wp/v2/pages?slug=sample-page&_embed
--------------------------------------------------------------------------------------*/
/**
 * GENERIC: Fetches a content item by its slug.
 * @param postType The CPT slug (e.g., 'posts', 'pages').
 * @param slug The item's slug.
 * @param lang Optional language code (e.g., 'en') for WPML support.
 */
export async function getContentBySlug<T extends WpContent>(postType: string, slug: string, lang?: string): Promise<T | null> {
  // We add `&_fields=...,blocks` to explicitly request the parsed Gutenberg blocks structure.
  // This is needed to reconstruct block wrappers that the REST API might strip out.
  // We also request rendered content to ensure shortcodes are processed.
  let query = `/wp/v2/${postType}?slug=${slug}&_embed&_fields=id,slug,title,content,excerpt,date,modified,author,featured_media,_links,_embedded,blocks,yoast_head_json`;
  if (lang && lang !== 'es') { // 'es' is default, no need to add param
    query += `&lang=${lang}`;
  }
  const data = await fetchAPI<T[]>(query);
  return data?.[0] ?? null;
}
 

/*--------------------------------------------------------------------------------------
    🍔 GET HOME PAGE CONTENT
    Route: /custom/v1/home-page?lang={lang} (or /wp/v2/pages?slug=inicio)
    e.g. /custom/v1/home-page?lang=en
--------------------------------------------------------------------------------------*/
/** Fetches the home page content, with optional language support. */
export async function getHomePage(lang?: string): Promise<Page | null> {
  // Use getContentBySlug directly to fetch the home page content
  const slug = lang === 'en' ? 'home' : 'inicio'; // Adjust slug based on language
  return await getContentBySlug<Page>('pages', slug, lang);
}


/*--------------------------------------------------------------------------------------
    🍔 GET HERO DATA
    Route: /custom/v1/hero-data
    e.g. /custom/v1/hero-data
--------------------------------------------------------------------------------------*/
/** Fetches hero data from the customizer endpoint. */
export async function getHeroData(): Promise<{
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  buttonText?: string;
  buttonLink?: string;
  // Add other hero-specific fields if needed
} | null> {
  return await fetchAPI('/custom/v1/hero-data');
}


/*--------------------------------------------------------------------------------------
    🍔 GET ACTIVE POPUPS (MODALES CPT)
    Route: /custom/v1/active-popups
    e.g. /custom/v1/active-popups
--------------------------------------------------------------------------------------*/
/** Fetches all modals that are configured as active popups. */
export async function getActivePopups(): Promise<Modal[] | null> {
  return await fetchAPI<Modal[]>('/custom/v1/active-popups');
}


/*--------------------------------------------------------------------------------------
    🍔 GET ALL MENUS (cached)
    Route: /custom/v1/menus
    Fetches a comprehensive object of all registered menus and their items.
--------------------------------------------------------------------------------------*/
/** Fetches all menus from WordPress and caches the result. */
export const getAllMenus = unstable_cache(
  async (): Promise<AllMenus | null> => {
    return await fetchAPI<AllMenus>('/custom/v1/menus');
  },
  ['all-menus'], // Cache key
  { revalidate: 300 } // Revalidate every 5 minutes
);

/*--------------------------------------------------------------------------------------
    🍔 GET POST NAVIGATION (PREVIOUS/NEXT)
    Route: /custom/v1/post-navigation?post_id={id}&post_type={type}
    e.g. /custom/v1/post-navigation?post_id=123&post_type=posts
--------------------------------------------------------------------------------------*/
/**
 * Fetches the previous and next post for navigation.
 * @param postId The ID of the current post.
 * @param postType The post type (e.g., 'posts').
 */
export async function getPostNavigation(postId: number, postType: string): Promise<PostNavigation | null> {
  // We force revalidation on every request for navigation data to ensure it's always up-to-date.
  return await fetchAPI<PostNavigation>(`/custom/v1/post-navigation?post_id=${postId}&post_type=${postType}`, { next: { revalidate: process.env.NODE_ENV === 'production' ? 60 : 0 } });
}


/*--------------------------------------------------------------------------------------
    � GET TRANSLATIONS (WPML)
    Route: /custom/v1/translations/{post_type}/{slug}
    e.g. /custom/v1/translations/pages/about
    Returns a map of all translated URLs for a piece of content.
--------------------------------------------------------------------------------------*/
/**
 * Fetches all translated URLs for a post, page, or CPT item.
 * @param postType The post type (e.g., 'pages', 'posts', 'hero').
 * @param slug The slug of the content.
 * @returns A map of language codes to URLs, e.g., { es: '/about', en: '/en/about' }
 */
export async function getTranslations(postType: string, slug: string): Promise<Record<string, string> | null> {
  return await fetchAPI<Record<string, string>>(`/custom/v1/translations/${postType}/${slug}`, { next: { revalidate: 300 } });
}


/*--------------------------------------------------------------------------------------
    �🍔 SEARCH SITE
    Route: /custom/v1/search?term={term}
    e.g. /custom/v1/search?term=example
--------------------------------------------------------------------------------------*/
/** Searches the site using a custom search endpoint. */
export async function searchSite(term: string): Promise<SearchResult[] | null> {
  if (!term) return [];

  // We use our custom endpoint which gives us full control over the search.
  // This avoids the issues of the native WP REST API search.
  const searchQuery = `/custom/v1/search?term=${encodeURIComponent(term)}`;
  const data = await fetchAPI<SearchResult[]>(searchQuery);
  // The fetchAPI function can now return null on error, or an empty array on 404.
  // We ensure to always return an array so that components don't fail.
  return data || [];
}
