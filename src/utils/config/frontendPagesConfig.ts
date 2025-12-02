// src/utils/frontendPagesConfig.ts
/**
 * Configuration for frontend-only pages (not managed by WordPress)
 * These pages exist in the Next.js app but don't have WordPress content
 */

type FrontendPageConfig = {
	slug: string;
	preserveOnLanguageSwitch: boolean; // If true, switching languages keeps you on this page
};

/**
 * Add new frontend-only pages here
 */
export const FRONTEND_PAGES: FrontendPageConfig[] = [
	{
		slug: 'sitemap',
		preserveOnLanguageSwitch: true,
	},
	{
		slug: 'search',
		preserveOnLanguageSwitch: true,
	},
	{
		slug: 'ui-components', // Example: style guide or component demo page
		preserveOnLanguageSwitch: true,
	},
];

/**
 * Check if a slug is a frontend-only page that should preserve on language switch
 */
export function shouldPreserveOnLanguageSwitch(slug: string): boolean {
	const page = FRONTEND_PAGES.find(p => p.slug === slug);
	return page?.preserveOnLanguageSwitch ?? false;
}

/**
 * Get all frontend page slugs
 */
export function getFrontendPageSlugs(): string[] {
	return FRONTEND_PAGES.map(p => p.slug);
}
