// src/components/ui/SliderBase.tsx
"use client";

import React, { Children } from 'react';
// Imports all Swiper components for React
import { Swiper, SwiperSlide } from 'swiper/react';
// Importamos TODOS los módulos que podríamos necesitar en cualquier slider.
// El bundle solo incluirá los que se usen en las `swiperOptions`.
import { Navigation, Pagination, A11y, Autoplay, EffectFade, Grid } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';

type SliderBaseProps = {
  children: React.ReactNode;
  swiperOptions?: SwiperOptions;
};

export default function SliderBase({ children, swiperOptions }: SliderBaseProps) {
  const slides = Children.toArray(children);

  if (!slides || slides.length === 0) {
    return null;
  }


/**********************************************
      START BUILDING SLIDER HTML
**********************************************/
  return (
    <div className="swiper-wrapper">
      <Swiper
        // Registramos todos los módulos posibles
        modules={[Navigation, Pagination, A11y, Autoplay, EffectFade, Grid]}
        {...swiperOptions}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            {slide}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}