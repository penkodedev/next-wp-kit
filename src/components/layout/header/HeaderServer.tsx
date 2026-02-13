// src/components/layout/header/HeaderServer.tsx

import Header from "./Header";
import { safeGetSiteInfo, fetchAPI } from "@/api/wordpressApi";
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import { logger } from "@/utils/wordpress/logger";
import localesConfig from "@/i18n/locales.generated.json";

interface HeaderServerProps {
  variant?: "default" | "home";
  menuVariant?: 'desktop' | 'mobile' | 'responsive';
  initialLocale?: string;
}

// Default fallback site info when WordPress is unavailable
const defaultSiteInfo: SiteInfo = {
  title: "Logo del sitio",
  description: "",
  back_url: "",
  front_url: "",
  light_logo: "/images/framework-logo-white.png",
  dark_logo: "/framework-logo.png",
  favicons: {
    icon_32: "",
    icon_180: "",
    icon_192: "",
    icon_512: "",
  },
  date_format: "",
  language: "",
  social: [],
  contact: [],
  analytics: {
    google_analytics_id: "",
    facebook_pixel_id: "",
    gtm_id: "",
    twitter_pixel_id: "",
  },
  i18n: {
    default_locale: localesConfig.defaultLocale,
    locales: localesConfig.supportedLocales,
  },
};

export default async function HeaderServer({
  variant = "default",
  menuVariant: menuVariantProp, // Controlled by props
  initialLocale,
}: HeaderServerProps) {
  // Handle undefined menuVariant (use responsive as default)
  const menuVariant = menuVariantProp || 'responsive';
  // Fetch site info (safe version)
  const siteInfo = await safeGetSiteInfo();
  
  const defaultLocale = siteInfo.i18n?.default_locale || localesConfig.defaultLocale;
  const locale = initialLocale || defaultLocale;

  // Pre-fetch menus for ALL active locales dynamically
  const menusByLocale: Record<string, MenuItem[]> = {};

  try {
    // Build promises array dynamically for all locales
    const menuPromises = localesConfig.supportedLocales.map(loc =>
      fetchAPI<MenuItem[]>(`/custom/v1/menus?lang=${loc}&location=mainnav`)
        .then(menu => ({ locale: loc, menu: menu || [] }))
        .catch(err => {
          logger.error(`Error fetching menu for ${loc}:`, err);
          return { locale: loc, menu: [] as MenuItem[] };
        })
    );

    const menuResults = await Promise.all(menuPromises);
    
    // Organize menus by locale
    menuResults.forEach(result => {
      menusByLocale[result.locale] = result.menu;
    });
  } catch (error) {
    logger.error('HeaderServer: Error pre-fetching menus', error as Error);
  }

  return (
    <Header 
      variant={variant}
      menuVariant={menuVariant}
      initialLocale={locale} 
      siteInfo={siteInfo}
      menusByLocale={menusByLocale}
    />
  );
}
