// src/components/layout/header/HeaderServer.tsx

import Header from "./Header";
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import localesConfig from "@/i18n/locales.generated.json";

interface HeaderServerProps {
  variant?: "default" | "home";
  menuVariant?: 'desktop' | 'mobile' | 'responsive';
  initialLocale?: string;
  siteInfo?: SiteInfo; // Accept siteInfo from parent
}

// Default fallback site info when WordPress is unavailable
const defaultSiteInfo: SiteInfo = {
  title: "Logo del sitio",
  description: "",
  back_url: "",
  front_url: "",
  light_logo: "/images/framework-logo-white.png",
  dark_logo: "/images/framework-logo.png",
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
  siteInfo: siteInfoProp, // Site info from parent
}: HeaderServerProps) {
  // Handle undefined menuVariant (use responsive as default)
  const menuVariant = menuVariantProp || 'responsive';
  
  // Use siteInfo from props or fallback to default
  const siteInfo = siteInfoProp || defaultSiteInfo;
  
  const defaultLocale = siteInfo.i18n?.default_locale || localesConfig.defaultLocale;
  const locale = initialLocale || defaultLocale;

  // Empty menus - will be fetched client-side
  const menusByLocale: Record<string, MenuItem[]> = {};

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
