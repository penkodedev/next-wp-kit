import { fetchAPI } from './client';

export interface HeroSlide {
  title: string;
  title_align: 'left' | 'center' | 'right';
  subtitle: string;
  content_position: 'top' | 'center' | 'bottom';
  content_align: 'left' | 'center' | 'right';
  overlay_opacity: number;
  overlay_color: string;
  ken_burns: number;
  button_text: string;
  button_link: string;
  button_style: 'default' | 'outline';
  background_type: 'image' | 'video' | 'gradient';
  background_image: string;
  background_video: string;
  video_playback_rate: number;
  gradient_color_1: string;
  gradient_color_2: string;
  gradient_direction: string;
  vignette_mode: 'none' | 'round' | 'up' | 'down';
  vignette_color: string;
  vignette_intensity: number;
  vignette_size: number;
}

export interface HeroData {
  active: boolean;
  position: 'home' | 'page' | 'archive' | 'custom';
  hero_id?: number;
  title?: string;
  settings?: {
    autoplay: boolean;
    interval: number;
    show_arrows: boolean;
    show_dots: boolean;
  };
  slides?: HeroSlide[];
  language?: string;
  message?: string;
}

/**
 * Fetches hero data for a specific position.
 * @param position - Where the hero should appear (home, page, archive, custom)
 * @param lang - Optional language code for WPML translation
 */
export async function getHeroData(
  position: 'home' | 'page' | 'archive' | 'custom',
  lang?: string
): Promise<HeroData | null> {
  const endpoint = `/custom/v1/hero?position=${position}${lang ? `&lang=${lang}` : ''}`;
  const data = await fetchAPI<HeroData>(endpoint, {
    next: { revalidate: 300 }
  });
  return data;
}
