// src/components/layout/header/HeaderServer.tsx

import HeaderClient from "./HeaderClient";
import { getSiteInfo, fetchAPI } from "@/api/wordpressApi";
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import { logger } from "@/utils/wordpress/logger";
import localesConfig from "@/i18n/locales.generated.json";

interface HeaderServerProps {
  variant?: "default" | "home";
  initialLocale?: string;
}

export default async function HeaderServer({
  variant = "default",
  initialLocale = "es",
}: HeaderServerProps) {
  const defaultSiteInfo: SiteInfo = {
    title: "Logo del sitio",
    description: "",
    back_url: "",
    front_url: "",
    light_logo: "/images/framework-logo-white.png",
    dark_logo: "/framework-logo.png",
    site_icon_url: "",
    date_format: "",
    language: "",
    social: [],
    contact: [],
  analytics: [],
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
    <HeaderClient 
      variant={variant} 
      initialLocale={initialLocale} 
      siteInfo={siteInfo}
      menusByLocale={menusByLocale}
    />
  );
}