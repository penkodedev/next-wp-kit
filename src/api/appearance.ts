import { fetchAPI } from './client';

export interface AppearanceSettings {
  spaMode: boolean;
  darkModeEnabled: boolean;
  defaultMode: 'light' | 'dark' | 'system';
  scrollToTop: boolean;
  breadcrumbs: boolean;
  loading: boolean;
  scrollProgress: boolean;
  lightbox: boolean;
  smoothScroll: boolean;
  popups: boolean;
  copyLink: boolean;
  likeButton: boolean;
  shareButton: boolean;
  ttsEnabled: boolean;
}

export async function getAppearanceSettings(lang?: string): Promise<AppearanceSettings | null> {
  const endpoint = lang ? `/custom/v1/appearance?lang=${lang}` : '/custom/v1/appearance';
  return await fetchAPI<AppearanceSettings>(endpoint);
}
