// src/components/layout/header/HeaderServer.tsx

import HeaderClient from "./HeaderClient";
import { getSiteInfo, fetchAPI } from "@/api/wordpressApi";
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import { logger } from "@/utils/logger";

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
    analytics: {},
    i18n: {
      default_locale: "",
      locales: [],
    },
  };

  // Pre-fetch both SiteInfo and both menu versions (Spanish and English) on the server
  let siteInfo: SiteInfo = defaultSiteInfo;
  let menuES: MenuItem[] = [];
  let menuEN: MenuItem[] = [];

  try {
    const [siteInfoData, menuESData, menuENData] = await Promise.all([
      getSiteInfo(),
      fetchAPI<MenuItem[]>('/custom/v1/menus?lang=es&location=mainnav'),
      fetchAPI<MenuItem[]>('/custom/v1/menus?lang=en&location=mainnav'),
    ]);
    
    siteInfo = siteInfoData || defaultSiteInfo;
    menuES = menuESData || [];
    menuEN = menuENData || [];
  } catch (error) {
    logger.error('HeaderServer: Error pre-fetching data', error);
  }

  return (
    <HeaderClient 
      variant={variant} 
      initialLocale={initialLocale} 
      siteInfo={siteInfo}
      menuES={menuES}
      menuEN={menuEN}
    />
  );
}