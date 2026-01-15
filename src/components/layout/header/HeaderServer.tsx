// src/components/layout/header/HeaderServer.tsx

import Header from "./Header";
import { getSiteInfo, fetchAPI } from "@/api/wordpressApi";
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import { logger } from "@/utils/wordpress/logger";
import localesConfig from "@/i18n/locales.generated.json";

interface HeaderServerProps {
  variant?: "default" | "home";
  menuVariant?: 'desktop' | 'mobile' | 'responsive';
  initialLocale?: string;
}

export default async function HeaderServer({
  variant = "default",
  menuVariant = "responsive", // CHANGE MENU BETWEEN 'desktop', 'mobile' or 'responsive'
  initialLocale,
}: HeaderServerProps) {
  // Get default locale from WordPress or config
  const siteInfoForLocale = await getSiteInfo();
  const defaultLocale = siteInfoForLocale?.i18n?.default_locale || localesConfig.defaultLocale;
  const locale = initialLocale || defaultLocale;
  
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

  // Pre-fetch SiteInfo and menus for ALL active locales dynamically
  let siteInfo: SiteInfo = defaultSiteInfo;
  const menusByLocale: Record<string, MenuItem[]> = {};

  try {
    // Build promises array dynamically for all locales
    const menuPromises = localesConfig.supportedLocales.map(locale =>
      fetchAPI<MenuItem[]>(`/custom/v1/menus?lang=${locale}&location=mainnav`)
        .then(menu => ({ locale, menu: menu || [] }))
        .catch(err => {
          logger.error(`Error fetching menu for ${locale}:`, err);
          return { locale, menu: [] };
        })
    );

    const [siteInfoData, ...menuResults] = await Promise.all([
      getSiteInfo(),
      ...menuPromises,
    ]);
    
    siteInfo = siteInfoData || defaultSiteInfo;
    
    // Organize menus by locale
    menuResults.forEach(result => {
      menusByLocale[result.locale] = result.menu;
    });
  } catch (error) {
  logger.error('HeaderServer: Error pre-fetching data', error as Error);
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