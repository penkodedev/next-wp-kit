import { unstable_cache } from 'next/cache';
import { fetchAPI } from './client';
import { logger } from '@/utils/wordpress/logger';
import type { SiteInfo } from '@/types/wordpressTypes';

/**
 * Fetches basic site information from a custom endpoint.
 * @param lang - Optional language code for WPML translation (e.g. 'en', 'es', 'pt-br')
 * @throws Error if the API fails to fetch site info (prevents caching failures)
 */
export async function getSiteInfo(lang?: string): Promise<SiteInfo> {
  const endpoint = lang ? `/custom/v1/site-info?lang=${lang}` : '/custom/v1/site-info';
  const data = await fetchAPI<SiteInfo>(endpoint);

  if (!data) {
    throw new Error(`[getSiteInfo] Failed to fetch site info${lang ? ` (lang: ${lang})` : ''}`);
  }

  return data;
}

/**
 * Cached version of getSiteInfo using Next.js unstable_cache.
 * Uses tags for on-demand revalidation via webhook.
 */
export const getCachedSiteInfo = unstable_cache(
  getSiteInfo,
  ['site-info'],
  { 
    revalidate: 60,
    tags: ['site-info']
  }
);

/**
 * Safe version of getSiteInfo that never throws.
 * Returns defaultSiteInfo if API fails.
 * Uses cached version to avoid duplicate API calls.
 */
export async function safeGetSiteInfo(lang?: string): Promise<SiteInfo> {
  try {
    return await getCachedSiteInfo(lang);
  } catch (error) {
    logger.error(`[safeGetSiteInfo] API failed, using default:`, error instanceof Error ? error.message : String(error));
    return {
      title: 'Reaxy | Next/React Kit with Headless WordPress',
      description: 'Reaxy is a Next Kit with Headless WordPress theme for Next.js/React',
      back_url: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '',
      front_url: process.env.NEXT_PUBLIC_BASE_URL || '',
      light_logo: '',
      dark_logo: '',
      favicons: {
        icon_32: '',
        icon_180: '',
        icon_192: '',
        icon_512: '',
      },
      date_format: 'j \\d\\e F \\d\\e Y',
      language: 'es',
      social: [],
      contact: [],
      analytics: {
        google_analytics_id: '',
        facebook_pixel_id: '',
        gtm_id: '',
        twitter_pixel_id: '',
      },
      i18n: {
        default_locale: 'es',
        locales: ['es', 'en', 'pt-br']
      }
    };
  }
}
