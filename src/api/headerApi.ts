// src/api/headerApi.ts
// Separate API file for Header to avoid circular dependencies

interface SiteInfo {
  title: string;
  description: string;
  back_url: string;
  front_url: string;
  light_logo: string;
  dark_logo: string;
  favicons: {
    icon_32: string;
    icon_180: string;
    icon_192: string;
    icon_512: string;
  };
  date_format: string;
  language: string;
  social: any[];
  contact: any[];
  analytics: {
    google_analytics_id: string;
    facebook_pixel_id: string;
    gtm_id: string;
    twitter_pixel_id: string;
  };
  i18n: {
    default_locale: string;
    locales: string[];
  };
}

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
const DEFAULT_LOCALE = 'es';
const SUPPORTED_LOCALES = ['es', 'en', 'pt-br'];

export async function getHeaderSiteInfo(): Promise<SiteInfo> {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_WORDPRESS_API_URL is not configured.");
    return getDefaultSiteInfo();
  }

  try {
    const url = `${API_URL!.replace(/\/$/, '')}/custom/v1/site-info`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 30 }
    });

    if (!res.ok) {
      console.error(`Site Info API Error: ${res.status} ${res.statusText}`);
      return getDefaultSiteInfo();
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Site Info fetch failed:', error instanceof Error ? error.message : String(error));
    return getDefaultSiteInfo();
  }
}

function getDefaultSiteInfo(): SiteInfo {
  return {
    title: "Reaxy",
    description: "Reaxy - Next/React Kit with Headless WordPress",
    back_url: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '',
    front_url: process.env.NEXT_PUBLIC_BASE_URL || '',
    light_logo: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/images/framework-logo-white.png`,
    dark_logo: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/framework-logo.png`,
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
      default_locale: DEFAULT_LOCALE,
      locales: SUPPORTED_LOCALES
    }
  };
}
