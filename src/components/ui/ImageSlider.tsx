// src/components/ui/ImageSlider.tsx
"use client";

import Image from 'next/image';
// Importa los componentes de Swiper para React
import { Swiper, SwiperSlide } from 'swiper/react';
// Importa los módulos que vamos a usar: Navegación, Paginación y A11y (Accesibilidad)
import { Navigation, Pagination, A11y } from 'swiper/modules';

// Importa los estilos base de Swiper
import 'swiper/css';
// Importa los estilos para los módulos de navegación y paginación
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * Definimos un tipo para las propiedades de cada slide.
 * En un caso real, esto podría venir de tu API de WordPress.
 */
type SlideData = {
  src: string;
  alt: string;
  id: number | string;
};

type ImageSliderProps = {
  slides: SlideData[];
};

export default function ImageSlider({ slides }: ImageSliderProps) {
  // Si no hay slides, no renderizamos nada.
  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <Swiper
      // Registra los módulos que importamos
      modules={[Navigation, Pagination, A11y]}
      spaceBetween={50} // Espacio entre slides
      slidesPerView={1} // Cuántos slides se ven a la vez
      navigation // Activa las flechas de navegación
      pagination={{ clickable: true }} // Activa la paginación (los puntitos) y los hace clickables
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          {/* Usamos el componente Image de Next.js para optimización */}
          <Image src={slide.src} alt={slide.alt} width={800} height={400} style={{ width: '100%', height: 'auto' }} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}