// src/utils/url.ts

/**
 * Cleans a WordPress URL to convert it into an internal relative route.
 * Removes the WordPress API domain and the frontend domain.
 * @param url The full URL to clean.
 * @returns The URL as a relative route (e.g., '/example-page').
 */
export function cleanInternalUrl(url: string): string {
	const wpDomain = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin : '';
	const frontendDomain = process.env.NEXT_PUBLIC_BASE_URL || '';
	return url.replace(wpDomain, '').replace(frontendDomain, '');
}
