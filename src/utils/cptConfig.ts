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
 * Get the translated slug for a CPT based on the locale.
 * @param cptSlug - The internal WordPress CPT slug (e.g., 'noticias', 'recursos')
 * @param locale - The target locale (e.g., 'es', 'en')
 * @returns The translated slug for the given locale, or the original slug if not found
 * 
 * @example
 * getTranslatedCptSlug('noticias', 'en') // Returns 'news'
 * getTranslatedCptSlug('recursos', 'en') // Returns 'resorts'
 */
export function getTranslatedCptSlug(cptSlug: string, locale: string): string {
  const cptConfig = CPT_CONFIG.find(config => config.slug === cptSlug);
  return cptConfig?.translations[locale] || cptSlug;
}
