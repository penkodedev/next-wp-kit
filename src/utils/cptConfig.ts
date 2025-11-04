// src/utils/cptConfig.ts
/**
 * Centralized configuration for Custom Post Types (CPTs)
 *
 * To add a new CPT to the kit:
 * 1. Add the slug to ACTIVE_CPTS
 * 2. Create pages in app/[slug]/page.tsx and app/[slug]/[slug]/page.tsx
 * 3. The system will automatically detect it in BodyClass, sitemap, etc.
 */


  // *******  Add new CPTs here: 'proyectos', 'productos', etc.  *******//
export const ACTIVE_CPTS = [
  'recursos',
  'news',
] as const;

export type CptSlug = typeof ACTIVE_CPTS[number];

/**
 * Verifica si un slug es un CPT activo
 */
export function isActiveCpt(slug: string): slug is CptSlug {
  return ACTIVE_CPTS.includes(slug as CptSlug);
}

/**
 * Obtiene todos los slugs de CPTs activos
 */
export function getActiveCptSlugs(): readonly string[] {
  return ACTIVE_CPTS;
}