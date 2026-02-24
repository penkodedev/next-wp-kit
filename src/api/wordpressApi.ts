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


import type { WpContent, SiteInfo, MenuItem, SearchResult, Page, Modal, PostNavigation, AllMenus, Post } from '@/types/wordpressTypes';
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
      // Next.js cache options (cache for 30 seconds in both production and development)
      next: next || { revalidate: 30 },
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
 * @throws Error if the API fails to fetch site info (prevents caching failures)
 */
export async function getSiteInfo(lang?: string): Promise<SiteInfo> {
  const endpoint = lang ? `/custom/v1/site-info?lang=${lang}` : '/custom/v1/site-info';
  const data = await fetchAPI<SiteInfo>(endpoint);

  if (!data) {
    throw new Error(`[getSiteInfo] Failed to fetch site info${lang ? ` (lang: ${lang})` : ''}`);
  }

  return data;
}

/**
 * Cached version of getSiteInfo using Next.js unstable_cache.
 * Caches site info for 1 hour to avoid redundant API calls.
 * Uses tags for on-demand revalidation via webhook.
 * @param lang - Optional language code for WPML translation
 */
export const getCachedSiteInfo = unstable_cache(
  getSiteInfo,
  ['site-info'],
  { 
    revalidate: 60, // Cache for 60 seconds (dev), increase for production
    tags: ['site-info'] // Enables revalidateTag('site-info') for on-demand invalidation
  }
);

/**
 * Safe version of getSiteInfo that never throws.
 * Returns defaultSiteInfo if API fails.
 * Use this in components that need graceful fallback.
 * Uses cached version to avoid duplicate API calls.
 */
export async function safeGetSiteInfo(lang?: string): Promise<SiteInfo> {
  try {
    return await getCachedSiteInfo(lang);
  } catch (error) {
    logger.error(`[safeGetSiteInfo] API failed, using default:`, error instanceof Error ? error.message : String(error));
    // Return default SiteInfo to prevent app crash
    return {
      title: 'Reaxy | Next/React Kit with Headless WordPress',
      description: 'Reaxy is a Next Kit with Headless WordPress theme for Next.js/React',
      back_url: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '',
      front_url: process.env.NEXT_PUBLIC_BASE_URL || '',
      light_logo: '',
      dark_logo: '',
      favicons: {
        icon_32: '',
        icon_180: '',
        icon_192: '',
        icon_512: '',
      },
      date_format: 'j \\d\\e F \\d\\e Y',
      language: 'es',
      social: [],
      contact: [],
      analytics: {
        google_analytics_id: '',
        facebook_pixel_id: '',
        gtm_id: '',
        twitter_pixel_id: '',
      },
      i18n: {
        default_locale: 'es',
        locales: ['es', 'en', 'pt-br']
      }
    };
  }
}

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
    🍔 GET ALL POSTS
    Route: /wp/v2/posts?per_page=100&_embed
    Fetches all posts with embedded data
--------------------------------------------------------------------------------------*/
/**
 * Fetches all posts from WordPress REST API.
 * @param params Optional query parameters (e.g., '?per_page=10')
 * @returns Array of Post objects
 */
export async function getAllPosts(params: string = ''): Promise<Post[] | null> {
  return await fetchAPI<Post[]>(`/wp/v2/posts${params}`);
}

/**
 * Cached version of getAllPosts using Next.js unstable_cache.
 * Caches posts for 5 minutes to avoid redundant API calls.
 * Use this in pages that need post listings.
 */
export const getCachedAllPosts = unstable_cache(
  async (params: string = ''): Promise<Post[] | null> => {
    return await fetchAPI<Post[]>(`/wp/v2/posts${params}`);
  },
  ['all-posts'],
  { revalidate: 300 } // Cache for 5 minutes
);


/*--------------------------------------------------------------------------------------
    🍔 GET ALL PAGES
    Route: /wp/v2/pages?per_page=100&_embed
    Fetches all pages with embedded data
--------------------------------------------------------------------------------------*/
/**
 * Fetches all pages from WordPress REST API.
 * @param params Optional query parameters (e.g., '?per_page=10')
 * @returns Array of Page objects
 */
export async function getAllPages(params: string = ''): Promise<Page[] | null> {
  return await fetchAPI<Page[]>(`/wp/v2/pages${params}`);
}

/**
 * Fetches a single page by slug.
 * @param slug Page slug
 * @param lang Optional language parameter
 * @returns Page object or null
 */
export async function getPage(slug: string, lang?: string): Promise<Page | null> {
  const params = slug 
    ? `?slug=${slug}${lang ? `&lang=${lang}` : ''}&_embed`
    : '';
  const pages = await fetchAPI<Page[]>(`/wp/v2/pages${params}`);
  return pages && pages.length > 0 ? pages[0] : null;
}

/**
 * Cached version of getAllPages using Next.js unstable_cache.
 * Caches pages for 5 minutes to avoid redundant API calls.
 * Use this in pages that need page listings.
 */
export const getCachedAllPages = unstable_cache(
  async (params: string = ''): Promise<Page[] | null> => {
    return await fetchAPI<Page[]>(`/wp/v2/pages${params}`);
  },
  ['all-pages'],
  { revalidate: 300 } // Cache for 5 minutes
);

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
  // Get the front page by querying with is_front_page meta key
  // This reliably gets the page configured in WordPress Settings > Reading
  let query = '/wp/v2/pages?per_page=100&_embed';
   
  if (lang && lang !== localesConfig.defaultLocale) {
    query += `&lang=${lang}`;
  }
   
  const pages = await fetchAPI<Page[]>(query);
   
  if (pages && pages.length > 0) {
    // Find the page marked as front page (template = front-page)
    const frontPage = pages.find(p => 
      p.template === 'front-page' || 
      p.meta?.['_wp_page_template'] === 'front-page'
    );
     
    if (frontPage) {
      return frontPage;
    }
     
    // Fallback: look for pages with common home page slugs
    const commonSlugs = ['inicio', 'home', 'portada', 'accueil', 'landing'];
    for (const slug of commonSlugs) {
      const page = pages.find(p => p.slug === slug);
      if (page) return page;
    }
     
    // Final fallback: return first page
    return pages[0];
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
    🔎 SEARCH SITE
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
// In-memory cache for WPML translations (5 minutes)
let wpmlTranslationCache: { [key: string]: { data: WpmlTranslation | null; timestamp: number } } = {};

export async function getWpmlTranslation(postId: number, targetLang: string): Promise<WpmlTranslation | null> {
  const cacheKey = `${postId}-${targetLang}`;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Return cached data if still valid
  if (wpmlTranslationCache[cacheKey] && 
      wpmlTranslationCache[cacheKey].data && 
      (Date.now() - wpmlTranslationCache[cacheKey].timestamp < CACHE_DURATION)) {
    return wpmlTranslationCache[cacheKey].data;
  }
  
  try {
    const data = await fetchAPI<WpmlTranslation>(`/custom/v1/translation/${postId}?lang=${targetLang}`);
    
    // Cache the result
    wpmlTranslationCache[cacheKey] = {
      data: data || null,
      timestamp: Date.now()
    };
    
    return data || null;
  } catch (error) {
    logger.error(`Error fetching WPML translation for post ${postId}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Get Ticker Settings from WordPress
 * Route: /custom/v1/ticker
 */
export interface TickerSettings {
  enabled: boolean;
  pages: number[];
  text: string;
  link?: string;
  speed: number;
  size: 'small' | 'medium' | 'big' | 'extra-big';
  noAnimate: boolean;
  pauseOnHover: boolean;
  message?: string;
}

export async function getTickerSettings(): Promise<TickerSettings | null> {
  const data = await fetchAPI<TickerSettings>('/custom/v1/ticker');
  return data;
}

// In-memory cache for ticker settings (simple implementation)
let tickerCache: { data: TickerSettings | null; timestamp: number } = { data: null, timestamp: 0 };

/**
 * Get Ticker Settings with caching (5 minutes)
 * Uses in-memory cache to avoid repeated API calls
 */
export async function getCachedTickerSettings(): Promise<TickerSettings | null> {
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Return cached data if still valid
  if (tickerCache.data && (Date.now() - tickerCache.timestamp < CACHE_DURATION)) {
    return tickerCache.data;
  }
  
  // Fetch fresh data
  const data = await getTickerSettings();
  
  // Update cache
  tickerCache = { data, timestamp: Date.now() };
  
  return data;
}

/**
 * Force refresh ticker settings cache
 */
export function invalidateTickerCache(): void {
  tickerCache = { data: null, timestamp: 0 };
}

/*--------------------------------------------------------------------------------------
    🔒 SAFE GET ALL CONTENT (for generateStaticParams)
    Wrapper that never throws, returns null on error instead.
    Used in generateStaticParams where throwing would fail the build.
--------------------------------------------------------------------------------------*/
export async function safeGetAllContent<T extends WpContent>(postType: string, params: string = ''): Promise<T[] | null> {
  try {
    return await getAllContent<T>(postType, params);
  } catch (error) {
    logger.error(`safeGetAllContent failed for ${postType}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

/*--------------------------------------------------------------------------------------
    🌐 GET WPML LANGUAGES
    Route: /custom/v1/languages
    Returns the list of active languages in WPML
--------------------------------------------------------------------------------------*/
export interface WpmlLanguage {
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  url: string;
}

export interface WpmlLanguages {
  languages: WpmlLanguage[];
  default: string;
  count: number;
}

export async function getWpmlLanguages(): Promise<WpmlLanguages | null> {
  return await fetchAPI<WpmlLanguages>('/custom/v1/languages');
}

/*--------------------------------------------------------------------------------------
    ❤️ LIKE POST
    Route: /custom/v1/posts/{id}/like
    Increment like count for a post
--------------------------------------------------------------------------------------*/
export async function likePost(postId: number): Promise<{ success: boolean; likes: number } | null> {
  return await fetchAPI<{ success: boolean; likes: number }>(`/custom/v1/posts/${postId}/like`, { method: 'POST' });
}
