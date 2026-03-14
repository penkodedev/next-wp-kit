// src/components/sections/sliders/SliderBase.tsx

/**
 * Client Component that wraps Swiper.js with configurable options
 * (autoplay, navigation, pagination, free mode, etc.).
 */

"use client";

import React, { Children } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay, EffectFade, Grid, FreeMode } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';

type SliderBaseProps = {
  children: React.ReactNode;
  swiperOptions?: SwiperOptions;
  className?: string;
};

export default function SliderBase({ children, swiperOptions, className }: SliderBaseProps) {
  const slides = Children.toArray(children);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className={`swiper-wrapper${className ? ` ${className}` : ''}`}>
      <Swiper
        modules={[Navigation, Pagination, A11y, Autoplay, EffectFade, Grid, FreeMode]}
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
