// src/api/wordpress.ts

import type { WpContent, SiteInfo, MenuItem, SearchResult, PostNavigation, Post, Page, Proyecto, Modal } from '@/types/wordpressTypes';
const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;


// ********************** Core Fetch API Function **********************
async function fetchAPI<T>( 
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
    console.error("La variable de entorno NEXT_PUBLIC_WORDPRESS_API_URL no está configurada.");
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
      // Next.js cache options (revalidates every hour by default, but can be overridden)
      next: next || { revalidate: 3600 }, 
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
        console.error(`API Error for ${query}:`, errorBody);
      } catch {
        console.error(`API Error for ${query}: ${res.status} ${res.statusText}`);
      }
      // We return null so the calling component can handle it.
      return null;
    }

    const json: T = await res.json();
    return json;
  } catch (error) {
    // If the fetch fails (e.g., WP is unavailable), we catch the error.
    console.error(`Fetch failed for ${requestUrl}:`, error instanceof Error ? error.message : String(error));
    // We return null to prevent the app from crashing on the server.
    return null;
  }
}


/**
 * Fetches basic site information from a custom endpoint.
 * EXAMPLE: This function assumes you have created a custom endpoint in your
 * WordPress functions.php that returns the site title and description.
 */
export async function getSiteInfo(): Promise<SiteInfo | null> {
  const data = await fetchAPI<SiteInfo>('/custom/v1/site-info');
  return data;
}

/**
 * GENERIC: Fetches a collection of items from any CPT.
 * @param postType The CPT slug (e.g., 'posts', 'pages', 'recursos').
 * @param params Optional query string (e.g., '?per_page=10&_embed').
 */
export async function getAllContent<T extends WpContent>(postType: string, params: string = ''): Promise<T[] | null> {
  const data = await fetchAPI<T[]>(`/wp/v2/${postType}${params}`);
  return data || [];
}

/**
 * GENERIC: Fetches a content item by its slug.
 * @param postType The CPT slug (e.g., 'posts', 'pages', 'recursos').
 * @param slug The item's slug.
 */
export async function getContentBySlug<T extends WpContent>(postType: string, slug: string): Promise<T | null> {
  // We add `&_fields=...,blocks` to explicitly request the parsed Gutenberg blocks structure.
  // This is needed to reconstruct block wrappers that the REST API might strip out.
  const data = await fetchAPI<T[]>(`/wp/v2/${postType}?slug=${slug}&_embed&_fields=id,slug,title,content,excerpt,date,modified,author,featured_media,_links,_embedded,blocks,yoast_head_json`);
  return data?.[0] ?? null;
}

/**
/******************** (HOME PAGE CONTENT) ****************************
 * This implementation assumes the home page has the slug 'inicio'.
 */
export async function getHomePage(): Promise<Page | null> {
  return await getContentBySlug<Page>('pages', 'inicio');
}

/**
 * Fetches hero data from the customizer endpoint.
 */
export async function getHeroData(): Promise<{
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  buttonText?: string;
  buttonLink?: string;
} | null> {
  return await fetchAPI('/custom/v1/hero-data');
}

/******************** (MODALES/POPUPS CPT) ****************************/
/**
 * Fetches all modals that are configured as active popups.
 */
export async function getActivePopups(): Promise<Modal[] | null> {
  return await fetchAPI<Modal[]>('/custom/v1/active-popups');
}


/******************** WORDPRESS MENUS ****************************/
/**
 * Fetches menu items by their slug from the custom endpoint.
 * @param slug The menu slug to fetch (e.g., 'main-menu').
 */
export async function getMenuItems(slug: string): Promise<MenuItem[] | null> {
  return await fetchAPI<MenuItem[]>(`/custom/v1/menus/${slug}`);
}

/**
 * Fetches menu items by their THEME LOCATION.
 * @param location The menu location slug (e.g., 'mainnav').
 */
export async function getMenuItemsByLocation(location: string): Promise<MenuItem[] | null> {
  return await fetchAPI<MenuItem[]>(`/custom/v1/menu-location/${location}`);
}

/******************** WORDPRESS POST NAVIGATION ****************************/
/**
 * Fetches the previous and next post for navigation.
 * @param postId The ID of the current post.
 * @param postType The post type (e.g., 'posts', 'recursos').
 */
export async function getPostNavigation(postId: number, postType: string): Promise<PostNavigation | null> {
  // We force revalidation on every request for navigation data to ensure it's always up-to-date.
  return await fetchAPI<PostNavigation>(`/custom/v1/post-navigation?post_id=${postId}&post_type=${postType}`, { next: { revalidate: 0 } });
}


/******************** WORDPRESS SEARCH ****************************/
/**
 * Searches the site using a custom search endpoint.
 * @param term The search term.
 */

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
