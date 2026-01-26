// src/api/wordpress.ts

/*--------------------------------------------------------------------------------------
    🏷️ GET ALL TAXONOMIES
    Route: /wp/v2/taxonomies
    Returns all registered taxonomies (built-in and custom)
--------------------------------------------------------------------------------------*/
import type { Taxonomy } from '@/types/wordpressTypes';

/**
 * Fetches all taxonomies from WordPress REST API.
 * Returns an object with taxonomy slugs as keys and Taxonomy objects as values.
 */
export async function getAllTaxonomies(): Promise<Record<string, Taxonomy> | null> {
  return await fetchAPI<Record<string, Taxonomy>>('/wp/v2/taxonomies');
}

/**
 * Cached version of getAllTaxonomies using Next.js unstable_cache.
 * Caches taxonomies for 1 hour to avoid redundant API calls in catch-all routes.
 * Use this in pages that need taxonomy information.
 */
export const getCachedTaxonomies = unstable_cache(
  async (): Promise<Record<string, Taxonomy> | null> => {
    return await fetchAPI<Record<string, Taxonomy>>('/wp/v2/taxonomies');
  },
  ['taxonomies'],
  { revalidate: 3600 } // Cache for 1 hour
);


import type { WpContent, SiteInfo, MenuItem, SearchResult, Page, Modal, PostNavigation, AllMenus } from '@/types/wordpressTypes';
import { unstable_cache } from 'next/cache';
import { logger } from '@/utils/wordpress/logger';
import localesConfig from '@/i18n/locales.generated.json';

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;


/*--------------------------------------------------------------------------------------
    🏷️ GET TERMS FOR TAXONOMY
    Route: /wp/v2/taxonomy/terms
    Returns all terms for a given taxonomy (built-in or custom)
--------------------------------------------------------------------------------------*/
import type { Term } from '@/types/wordpressTypes';

/**
 * Fetches all terms for a given taxonomy from WordPress REST API.
 * @param taxonomySlug The slug of the taxonomy (e.g. 'category', 'tags', 'recursos_categoria')
 * @returns Array of Term objects
 */
export async function getTermsForTaxonomy(taxonomySlug: string): Promise<Term[] | null> {
  return await fetchAPI<Term[]>(`/wp/v2/${taxonomySlug}`);
}

/*--------------------------------------------------------------------------------------
    WORDPRESS API CONSUMPTION
    This file is the central place for fetching data from the WordPress REST API.
    All custom endpoints consumed here are defined in the headless theme, specifically
    in the file: /inc/api/api-endpoints.php
--------------------------------------------------------------------------------------*/

// ********************** SWR Fetcher Function **********************
/**
 * SWR-compatible fetcher function for client-side data fetching.
 * Used with useSWR hook for caching and revalidation.
 * 
 * @param url - The REST API endpoint (relative path)
 * @returns The fetched data
 */
export async function swrFetcher<T>(url: string): Promise<T> {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_WORDPRESS_API_URL is not configured');
  }
  
  const requestUrl = `${API_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  const response = await fetch(requestUrl, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Makes a request to the WordPress REST API and returns typed data.
 *
 * @template T Expected data type in the response.
 * @param {string} [query=''] - Relative API endpoint (e.g., '/wp/v2/posts?per_page=10').
 * @param {Object} [options={}] - Additional fetch options.
 * @param {string} [options.method] - HTTP method (default 'GET').
 * @param {Record<string, string>} [options.headers] - Custom headers for the request.
 * @param {Record<string, any>|null} [options.body] - Request body (for POST/PUT).
 * @param {NextFetchRequestConfig} [options.next] - Next.js cache/revalidation config.
 * @returns {Promise<T|null>} The data received from the API, or null if there is an error.
 *
 * @example
 * // Fetch posts
 * const posts = await fetchAPI<Post[]>("/wp/v2/posts?per_page=5");
 *
 * // Create a new resource
 * const created = await fetchAPI<CustomType>("/custom/v1/endpoint", {
 *   method: "POST",
 *   body: { foo: "bar" }
 * });
 */
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
      // Next.js cache options (cache for 5 minutes in production, 60 seconds in development to reduce load on Local)
      next: next || { revalidate: process.env.NODE_ENV === 'production' ? 300 : 60 },
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
    e.g. /custom/v1/site-info?lang=en
--------------------------------------------------------------------------------------*/
/**
 * Fetches basic site information from a custom endpoint.
 * @param lang - Optional language code for WPML translation (e.g. 'en', 'es', 'pt-br')
 */
export async function getSiteInfo(lang?: string): Promise<SiteInfo | null> {
  const endpoint = lang ? `/custom/v1/site-info?lang=${lang}` : '/custom/v1/site-info';
  const data = await fetchAPI<SiteInfo>(endpoint);
  return data;
}

/**
 * Cached version of getSiteInfo using Next.js unstable_cache.
 * Caches site info for 1 hour to avoid redundant API calls.
 * Use this in layouts and components that don't need real-time data.
 * @param lang - Optional language code for WPML translation
 */
export const getCachedSiteInfo = unstable_cache(
  async (lang?: string): Promise<SiteInfo | null> => {
    const endpoint = lang ? `/custom/v1/site-info?lang=${lang}` : '/custom/v1/site-info';
    return await fetchAPI<SiteInfo>(endpoint);
  },
  ['site-info'],
  { revalidate: 3600 } // Cache for 1 hour
);

/*--------------------------------------------------------------------------------------
    🎬 GET HERO DATA
    Route: /custom/v1/hero?position={position}&lang={lang}
    Fetches hero configuration and slides for a specific position
--------------------------------------------------------------------------------------*/
export interface HeroSlide {
  title: string;
  title_align: 'left' | 'center' | 'right';
  subtitle: string;
  content_position: 'top' | 'center' | 'bottom';
  content_align: 'left' | 'center' | 'right';
  overlay_opacity: number;
  ken_burns: number;
  button_text: string;
  button_link: string;
  button_style: 'default' | 'outline';
  background_type: 'image' | 'video' | 'gradient';
  background_image: string;
  background_video: string;
  video_playback_rate: number;
  gradient_color_1: string;
  gradient_color_2: string;
  gradient_direction: string;
}

export interface HeroData {
  active: boolean;
  position: 'home' | 'page' | 'archive' | 'custom';
  hero_id?: number;
  title?: string;
  settings?: {
    autoplay: boolean;
    interval: number;
    show_arrows: boolean;
    show_dots: boolean;
  };
  slides?: HeroSlide[];
  language?: string;
  message?: string;
}

/**
 * Fetches hero data for a specific position.
 * @param position - Where the hero should appear (home, page, archive, custom)
 * @param lang - Optional language code for WPML translation
 * @returns Hero configuration with slides, or { active: false } if none found
 */
export async function getHeroData(
  position: 'home' | 'page' | 'archive' | 'custom',
  lang?: string
): Promise<HeroData | null> {
  const endpoint = `/custom/v1/hero?position=${position}${lang ? `&lang=${lang}` : ''}`;
  const data = await fetchAPI<HeroData>(endpoint, {
    next: { revalidate: 300 } // Cache for 5 minutes
  });
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
  let query = `/wp/v2/${postType}?slug=${slug}&_embed`;
  if (lang && lang !== localesConfig.defaultLocale) {
    query += `&lang=${lang}`;
  }
  const data = await fetchAPI<T[]>(query);
  
  return data?.[0] ?? null;
}
 

/*--------------------------------------------------------------------------------------
    🍔 GET HOME PAGE CONTENT
    Route: /wp/v2/pages?per_page=1&filter[meta_key]=_wp_page_template&filter[meta_value]=front-page
    Fetches the page set as "Front Page" in WordPress Settings > Reading
--------------------------------------------------------------------------------------*/
/** Fetches the home page content, with optional language support. */
export async function getHomePage(lang?: string): Promise<Page | null> {
  // WordPress identifies the front page with is_front_page metadata
  // We query for the page marked as front page in Settings > Reading
  let query = '/wp/v2/pages?per_page=1&_embed&orderby=menu_order&order=asc';
  
  if (lang && lang !== localesConfig.defaultLocale) {
    query += `&lang=${lang}`;
  }
  
  // First, try to get the designated front page
  const pages = await fetchAPI<Page[]>(query);
  
  if (pages && pages.length > 0) {
    // Return the first page (WordPress front page)
    return pages[0];
  }
  
  // Fallback: try getting by common home page slugs
  const commonSlugs = ['inicio', 'home', 'portada', 'accueil'];
  for (const slug of commonSlugs) {
    const page = await getContentBySlug<Page>('pages', slug, lang);
    if (page) return page;
  }
  
  return null;
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
export async function getPostNavigation(postId: number, postType: string, lang: string = localesConfig.defaultLocale): Promise<PostNavigation | null> {
  // We force revalidation on every request for navigation data to ensure it's always up-to-date.
  return await fetchAPI<PostNavigation>(`/custom/v1/post-navigation?post_id=${postId}&post_type=${postType}&lang=${lang}`, { next: { revalidate: process.env.NODE_ENV === 'production' ? 60 : 0 } });
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


/*--------------------------------------------------------------------------------------
    🌐 GET WPML TRANSLATION URL (NEW METHOD)
    Route: /custom/v1/translation/{post_id}?lang={lang}
    e.g. /custom/v1/translation/123?lang=en
    Returns the translated URL for a specific post/page ID using wpml_object_id
--------------------------------------------------------------------------------------*/
export interface WpmlTranslation {
  exists: boolean;
  original_id: number;
  translated_id?: number;
  target_lang: string;
  url?: string;
  full_url?: string;
  slug?: string;
  title?: string;
  post_type?: string;
  fallback_url?: string;
  message?: string;
}

/**
 * Gets the translated URL for a post/page using WPML
 * @param postId - The ID of the post/page in the current language
 * @param targetLang - The target language code (e.g., 'en', 'es')
 * @returns Translation data including the URL or fallback
 */
export async function getWpmlTranslation(postId: number, targetLang: string): Promise<WpmlTranslation | null> {
  try {
    const data = await fetchAPI<WpmlTranslation>(`/custom/v1/translation/${postId}?lang=${targetLang}`);
    
    // Clean up WordPress query params like ?page_id=657 when translation doesn't exist
    // WPML returns home URL with page_id when no translation is available
    if (data && data.url) {
      const url = new URL(data.url, 'http://localhost:3000');
      // If it has page_id param, it means no translation exists - return clean home URL
      if (url.searchParams.has('page_id')) {
        data.url = url.pathname; // Remove query params, keep only pathname
      }
    }
    
    return data;
  } catch (error) {
  logger.error(`Error fetching WPML translation for post ${postId} (lang: ${targetLang})`, error instanceof Error ? error : String(error));
    return null;
  }
}

/**
 * Helper function to get translated URL or fallback to home
 * @param postId - The ID of the post/page in the current language
 * @param targetLang - The target language code (e.g., 'en', 'es')
 * @returns The translated URL or home URL of target language
 */
export async function getTranslatedUrl(postId: number | undefined, targetLang: string): Promise<string> {
  // If no postId provided, go to home of target language
  if (!postId) {
    return targetLang === localesConfig.defaultLocale ? '/' : `/${targetLang}`;
  }

  const translation = await getWpmlTranslation(postId, targetLang);
  
  // If translation exists, return its URL
  if (translation?.exists && translation.url) {
    return translation.url;
  }
  
  // Fallback to home of target language
  return translation?.fallback_url || (targetLang === localesConfig.defaultLocale ? '/' : `/${targetLang}`);
}


/*--------------------------------------------------------------------------------------
    🌐 GET WPML LANGUAGES
    Route: /custom/v1/languages
    Returns all active languages from WPML configuration
--------------------------------------------------------------------------------------*/
export interface WpmlLanguage {
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  url: string;
}

export interface WpmlLanguagesResponse {
  languages: WpmlLanguage[];
  default: string;
  count: number;
}

// Fallback cuando WordPress no está disponible - usa localesConfig
const FALLBACK_LANGUAGES: WpmlLanguagesResponse = {
  languages: localesConfig.supportedLocales.map(code => ({
    code,
    name: code.toUpperCase(),
    native_name: code.toUpperCase(),
    is_default: code === localesConfig.defaultLocale,
    url: code === localesConfig.defaultLocale ? '/' : `/${code}`
  })),
  default: localesConfig.defaultLocale,
  count: localesConfig.supportedLocales.length
};

/**
 * Gets active languages from WPML
 * Cached for 1 hour in production, no cache in development
 */
export async function getWpmlLanguages(): Promise<WpmlLanguagesResponse> {
  try {
    const data = await fetchAPI<WpmlLanguagesResponse>('/custom/v1/languages', {
      next: { revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0 }
    });
    return data || FALLBACK_LANGUAGES;
  } catch (error) {
  logger.error('Error fetching WPML languages, using fallback', error instanceof Error ? error : String(error));
    return FALLBACK_LANGUAGES;
  }
}

/*--------------------------------------------------------------------------------------
    ❤️ POST LIKES
    Increment like count for a post and get current count
--------------------------------------------------------------------------------------*/

/**
 * Increments the like count for a post
 * @param postId The post ID to like
 * @returns Object with success status and new like count
 */
export async function likePost(postId: number): Promise<{ success: boolean; likes: number }> {
  try {
    const data = await fetchAPI<{ success: boolean; likes: number; post_id: number }>(`/custom/v1/like/${postId}`, {
      method: 'POST',
      next: { revalidate: 0 } // No cache for POST requests
    });
    return { success: data?.success || false, likes: data?.likes || 0 };
  } catch (error) {
    logger.error(`Error liking post ${postId}`, error instanceof Error ? error : String(error));
    throw new Error('Failed to like post');
  }
}

/**
 * Gets the current like count for a post
 * @param postId The post ID
 * @returns Current like count
 */
export async function getPostLikes(postId: number): Promise<number> {
  try {
    const data = await fetchAPI<{ post_id: number; likes: number }>(`/custom/v1/likes/${postId}`, {
      next: { revalidate: 60 } // Cache for 1 minute
    });
    return data?.likes || 0;
  } catch (error) {
    logger.error(`Error fetching likes for post ${postId}`, error instanceof Error ? error : String(error));
    return 0;
  }
}

