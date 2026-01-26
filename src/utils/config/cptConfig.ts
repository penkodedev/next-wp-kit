// src/utils/cptConfig.ts
/**
 * Centralized configuration for Custom Post Types (CPTs).
 * This is the ONLY SOURCE FOR CPTs and their translations.
 */

// Define the structure of a CPT configuration
type CptConfig = {
	slug: string; // The internal slug used in WordPress (e.g., 'noticias')
	translations: {
		[locale: string]: string; // Mapping of locale to translated slug (e.g., { es: 'noticias', en: 'news' })
	};
};

// *******  Add and configure new CPTs here: *******//
export const CPT_CONFIG: CptConfig[] = [
	{
		slug: 'noticias',
		translations: {
			es: 'noticias',
			en: 'news',
		},
	},
	{
		slug: 'recursos',
		translations: {
			es: 'recursos',
			en: 'resorts',
		},
	},
	{
		slug: 'modales',
		translations: {
			es: 'modales',
			en: 'modals',
		},
	},
	{
		slug: 'hero',
		translations: {
			es: 'hero',
			en: 'hero',
		},
	},
];

// Generates a map of all translated slugs to their internal WP slug.
// This is what detectRouteType will use to identify CPTs.
// Result: { noticias: 'noticias', news: 'noticias', recursos: 'recursos', resorts: 'recursos', ... }
export const CPT_SLUG_MAP: Record<string, string> = CPT_CONFIG.reduce((acc, cpt) => {
	for (const locale in cpt.translations) {
		const translatedSlug = cpt.translations[locale];
		acc[translatedSlug] = cpt.slug;
	}
	return acc;
}, {} as Record<string, string>);

/**
 * Get the translated slug for a post type based on the locale.
 * Works for both native post types (posts, pages) and custom post types.
 *
 * @param postType - The internal WordPress post type slug (e.g., 'posts', 'noticias', 'recursos')
 * @param locale - The target locale (e.g., 'es', 'en')
 * @returns The translated slug for the given locale, or the original slug if not found
 *
 * @example
 * getTranslatedCptSlug('posts', 'en') // Returns 'posts'
 * getTranslatedCptSlug('noticias', 'en') // Returns 'news'
 * getTranslatedCptSlug('recursos', 'en') // Returns 'resorts'
 */
export function getTranslatedCptSlug(postType: string, locale: string): string {
	// Handle native WordPress post types (posts, pages, etc.)
	if (postType === 'posts' || postType === 'pages') {
		return postType;
	}

	// Handle custom post types
	const cptConfig = CPT_CONFIG.find(config => config.slug === postType);
	return cptConfig?.translations[locale] || postType;
}

/**
 * Get all active CPT slugs (internal WordPress slugs).
 * Useful for dynamic operations like sitemap generation.
 *
 * @param exclude - Optional array of CPT slugs to exclude (e.g., ['modales', 'hero'])
 * @returns Array of CPT slugs
 *
 * @example
 * getActiveCptSlugs() // Returns ['noticias', 'recursos', 'modales', 'hero']
 * getActiveCptSlugs(['modales', 'hero']) // Returns ['noticias', 'recursos']
 */
export function getActiveCptSlugs(exclude: string[] = []): string[] {
	return CPT_CONFIG
		.map(config => config.slug)
		.filter(slug => !exclude.includes(slug));
}
