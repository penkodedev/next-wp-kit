// src/utils/cptConfig.ts
/**
 * Configuración centralizada para Custom Post Types (CPTs).
 * Esta es la ÚNICA fuente de verdad para los CPTs y sus traducciones.
 */

// Define la estructura de la configuración de un CPT
type CptConfig = {
  slug: string; // El slug interno usado en WordPress (ej. 'noticias')
  translations: {
    [locale: string]: string; // Mapeo de locale a slug traducido (ej. { es: 'noticias', en: 'news' })
  };
};

// *******  Añade y configura nuevos CPTs aquí: *******//
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

// Genera un mapa de todos los slugs traducidos a su slug interno de WP.
// Esto es lo que usará detectRouteType para saber qué es un CPT.
// Resultado: { noticias: 'noticias', news: 'noticias', recursos: 'recursos', resorts: 'recursos', ... }
export const CPT_SLUG_MAP: Record<string, string> = CPT_CONFIG.reduce((acc, cpt) => {
  for (const locale in cpt.translations) {
    const translatedSlug = cpt.translations[locale];
    acc[translatedSlug] = cpt.slug;
  }
  return acc;
}, {} as Record<string, string>);
