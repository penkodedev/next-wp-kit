// src/components/ui/SliderLatestRecursos.tsx

import { getAllContent } from "@/api/wordpressApi";
import PostCard from "@/components/ui/PostCard";
import type { Recurso } from "@/types/wordpressTypes";
import dynamic from "next/dynamic";
import type { SwiperOptions } from "swiper/types";

// Importamos SliderBase de forma dinámica y deshabilitamos el SSR para él.
const SliderBase = dynamic(() => import("@/components/ui/SliderBase"), {
  ssr: false,
});

/**
 * Un componente de servidor que obtiene los últimos recursos
 * y los muestra en un carrusel.
 */
export default async function SliderLatestRecursos() {
  // 1. Obtenemos los 8 últimos recursos desde la API de WordPress.
  const params = `?per_page=8&page=1&_embed&orderby=date&order=desc`;
  const latestRecursos = await getAllContent<Recurso>('recursos', params);

  // Si no hay recursos, no mostramos nada.
  if (!latestRecursos || latestRecursos.length === 0) {
      return <p>No se encontraron recursos recientes.</p>;
      
  }

  // 2. Filtramos solo los recursos que tienen imagen destacada para asegurar que el PostCard se vea bien.
  const recursosConImagen = latestRecursos.filter(
    (recurso) => recurso._embedded?.["wp:featuredmedia"]?.[0]?.source_url
  );


  // 3. Definimos la configuración.
  const sliderOptions: SwiperOptions = {
    spaceBetween: 0,
    slidesPerView: 3.4, // Permite que los slides fluyan con su ancho natural
    speed: 7000, // Aumentamos la duración para un movimiento lento y suave
    freeMode: true,
    navigation: false,
    pagination: { clickable: true },
    loop: true,
    loopAdditionalSlides: 1, // ¡Importante! Ayuda a que el bucle sea fluido y sin saltos.
    allowTouchMove: true, // Desactiva el arrastre manual para un efecto de marquesina puro.
    autoplay: {
      delay: 0, disableOnInteraction: false,
      
    },



// =================================================================
//                      Responsive Breakpoints
// =================================================================

        breakpoints: {
          // Cuando el ancho de la ventana es >= 640px
          640: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          // Cuando el ancho de la ventana es >= 1024px
          1024: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
    },
         };

  // 3. Renderizamos el componente de cliente SliderBase con los datos ya cargados.
  // Creamos los PostCards aquí y los pasamos como hijos a SliderBase.
  return (
    <SliderBase swiperOptions={sliderOptions}>
      {recursosConImagen.map((recurso) => (
        <PostCard key={recurso.id} item={recurso} basePath="/recursos" />
      ))}
    </SliderBase>
  );
}
