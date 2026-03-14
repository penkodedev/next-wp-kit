// src/components/sections/sliders/buildSwiperOptions.ts

/**
 * Pure function that builds Swiper.js options object
 * from WordPress slider configuration.
 */

import type { SliderConfig } from '@/api/wordpressApi';
import type { SwiperOptions } from 'swiper/types';

export function buildSwiperOptions(config: SliderConfig): SwiperOptions {
  const perView = config.perView || 3;
  const speed = config.speed || 5000;
  const gap = config.gap ?? 20;

  return {
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: gap,
    speed,
    loop: config.loop === 1,
    freeMode: true,
    navigation: config.navigation === 1,
    pagination: config.pagination === 1 ? { clickable: true } : false,
    autoplay: config.autoplay === 1
      ? { delay: 0, disableOnInteraction: false }
      : false,
    breakpoints: {
      640: { slidesPerView: Math.min(perView, 2) },
      1024: { slidesPerView: perView },
    },
  };
}
