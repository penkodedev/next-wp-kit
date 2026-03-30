import { logger } from '@/utils/wordpress/logger';

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

/**
 * SWR-compatible fetcher function for client-side data fetching.
 * Used with useSWR hook for caching and revalidation.
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
 * const posts = await fetchAPI<Post[]>("/wp/v2/posts?per_page=5");
 *
 * @example
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
  if (!API_URL) {
    logger.error("NEXT_PUBLIC_WORDPRESS_API_URL environment variable is not configured.");
    return null;
  }

  const headers = { 'Content-Type': 'application/json' };
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
      next: next || { revalidate: 30 },
    });

    if (!res.ok) {
      if (res.status === 404 && query.includes('/wp/v2/search')) {
        return [] as T;
      }

      try {
        const errorBody = await res.json();
        logger.error(`API Error for ${query}:`, errorBody);
      } catch {
        logger.error(`API Error for ${query}: ${res.status} ${res.statusText}`);
      }
      return null;
    }

    const json: T = await res.json();
    return json;
  } catch (error) {
    logger.error(`Fetch failed for ${requestUrl}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}
