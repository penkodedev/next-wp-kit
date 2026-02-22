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

interface MenuItem {
  id: number;
  title: string;
  url: string;
  children?: MenuItem[];
  classes?: string[];
  target?: string;
  parent?: string;
}

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
const DEFAULT_LOCALE = 'es';
const SUPPORTED_LOCALES = ['es', 'en', 'pt-br'];

export async function getHeaderData() {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_WORDPRESS_API_URL is not configured.");
    return {
      siteInfo: getDefaultSiteInfo(),
      menusByLocale: {} as Record<string, MenuItem[]>
    };
  }

  try {
    // Fetch site info and menus in parallel
    const [siteInfo, menusByLocale] = await Promise.all([
      fetchSiteInfo(),
      fetchMenus()
    ]);

    return { siteInfo, menusByLocale };
  } catch (error) {
    console.error('Error fetching header data:', error instanceof Error ? error.message : String(error));
    return {
      siteInfo: getDefaultSiteInfo(),
      menusByLocale: {} as Record<string, MenuItem[]>
    };
  }
}

async function fetchSiteInfo(): Promise<SiteInfo> {
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

async function fetchMenus(): Promise<Record<string, MenuItem[]>> {
  const menusByLocale: Record<string, MenuItem[]> = {};

  try {
    // Fetch menus for all locales in parallel
    const menuPromises = SUPPORTED_LOCALES.map(async (locale) => {
      try {
        const url = `${API_URL!.replace(/\/$/, '')}/custom/v1/menus?lang=${locale}&location=mainnav`;
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 30 }
        });

        if (!res.ok) {
          return { locale, menu: [] as MenuItem[] };
        }

        const menu = await res.json();
        return { locale, menu: menu || [] as MenuItem[] };
      } catch (err) {
        console.error(`Error fetching menu for ${locale}:`, err);
        return { locale, menu: [] as MenuItem[] };
      }
    });

    const menuResults = await Promise.all(menuPromises);
    
    // Organize menus by locale
    menuResults.forEach(result => {
      menusByLocale[result.locale] = result.menu;
    });
  } catch (error) {
    console.error('Error fetching menus:', error instanceof Error ? error.message : String(error));
  }

  return menusByLocale;
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
