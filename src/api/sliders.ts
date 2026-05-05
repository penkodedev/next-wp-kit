import { fetchAPI } from './client';
import type { WpContent } from '@/types/wordpressTypes';

export type SliderType = 'cpt' | 'testimonials' | 'media' | 'custom';

export interface SliderConfig {
  autoplay: number;
  speed: number;
  perView: number;
  loop: number;
  navigation: number;
  pagination: number;
  fullWidth: number;
  displayMode: 'contain' | 'cover';
  gap: number;
  grayscale: number;
  opacity: number;
  showExcerpt: number;
  excerptLength: number;
  imageLink: number;
}

export interface SliderSlide {
  name?: string;
  role?: string;
  text?: string;
  title?: string;
  caption?: string;
  image_id?: number;
  image_url?: string;
  image_thumb?: string;
  link?: string;
  alt?: string;
}

export interface SliderData {
  id: number;
  title: string;
  type: SliderType;
  config: SliderConfig;
  source?: { postType: string; perPage: number; order: string };
  slides?: SliderSlide[];
  posts?: WpContent[];
}

export async function getSliderById(id: number, lang?: string): Promise<SliderData | null> {
  const endpoint = lang ? `/custom/v1/sliders/${id}?lang=${lang}` : `/custom/v1/sliders/${id}`;
  return await fetchAPI<SliderData>(endpoint);
}
