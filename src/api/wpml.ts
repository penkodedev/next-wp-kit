import { fetchAPI } from './client';
import { logger } from '@/utils/wordpress/logger';

export interface WpmlTranslation {
  exists: boolean;
  original_id: number;
  translated_id?: number;
  target_lang: string;
  url?: string;
  full_url?: string;
  slug?: string;
  title?: string;
  post_type?: string;
  fallback_url?: string;
  message?: string;
}

let wpmlTranslationCache: { [key: string]: { data: WpmlTranslation | null; timestamp: number } } = {};

/**
 * Gets the translated URL for a post/page using WPML.
 * @param postId - The ID of the post/page in the current language
 * @param targetLang - The target language code (e.g., 'en', 'es')
 */
export async function getWpmlTranslation(postId: number, targetLang: string): Promise<WpmlTranslation | null> {
  const cacheKey = `${postId}-${targetLang}`;
  const CACHE_DURATION = 5 * 60 * 1000;
  
  if (wpmlTranslationCache[cacheKey] && 
      wpmlTranslationCache[cacheKey].data && 
      (Date.now() - wpmlTranslationCache[cacheKey].timestamp < CACHE_DURATION)) {
    return wpmlTranslationCache[cacheKey].data;
  }
  
  try {
    const data = await fetchAPI<WpmlTranslation>(`/custom/v1/translation/${postId}?lang=${targetLang}`);
    
    wpmlTranslationCache[cacheKey] = {
      data: data || null,
      timestamp: Date.now()
    };
    
    return data || null;
  } catch (error) {
    logger.error(`Error fetching WPML translation for post ${postId}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

export interface WpmlLanguage {
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  url: string;
}

export interface WpmlLanguages {
  languages: WpmlLanguage[];
  default: string;
  count: number;
}

export async function getWpmlLanguages(): Promise<WpmlLanguages | null> {
  return await fetchAPI<WpmlLanguages>('/custom/v1/languages');
}
