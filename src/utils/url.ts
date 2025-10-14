// src/utils/url.ts

/**
 * Limpia una URL de WordPress para convertirla en una ruta relativa interna.
 * Elimina el dominio de la API de WordPress y el dominio del frontend.
 * @param url La URL completa a limpiar.
 * @returns La URL como una ruta relativa (ej: '/pagina-de-ejemplo').
 */


export function cleanInternalUrl(url: string): string {
  const wpDomain = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_API_URL).origin : '';
  const frontendDomain = process.env.NEXT_PUBLIC_BASE_URL || '';
  return url.replace(wpDomain, '').replace(frontendDomain, '');
}
