// src/components/sliders/LatestRecursosSlider.tsx

import { getLatestRecursos } from '@/api/wordpressApi';
import ImageSlider from '@/components/ui/ImageSlider';
import type { Recurso } from '@/types/wordpressTypes';

/**
 * Un componente de servidor que obtiene los últimos recursos
 * y los muestra en un carrusel.
 */
export default async function LatestRecursosSlider() {
  // 1. Obtenemos los 8 últimos recursos desde la API de WordPress.
  const latestRecursos = await getLatestRecursos(8);

  // Si no hay recursos, no mostramos nada.
  if (!latestRecursos || latestRecursos.length === 0) {
    return <p>No se encontraron recursos recientes.</p>;
  }

  // 2. Transformamos los datos de los recursos al formato que espera ImageSlider.
  // Filtramos solo los que tienen imagen destacada.
  const slides = latestRecursos
    .map((recurso: Recurso) => {
      const featuredMedia = recurso._embedded?.['wp:featuredmedia']?.[0];
      if (!featuredMedia?.source_url) {
        return null;
      }

      return {
        id: recurso.id,
        src: featuredMedia.source_url,
        alt: recurso.title.rendered,
      };
    })
    .filter(Boolean); // Eliminamos los elementos nulos del array

  // 3. Renderizamos el componente de cliente ImageSlider con los datos ya cargados.
  return <ImageSlider slides={slides} />;
}