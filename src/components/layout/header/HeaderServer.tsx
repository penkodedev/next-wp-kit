// src/components/layout/header/HeaderServer.tsx

import Header from "./Header";
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import localesConfig from "@/i18n/locales.generated.json";

interface HeaderServerProps {
  variant?: "default" | "home";
  menuVariant?: 'desktop' | 'mobile' | 'responsive';
  initialLocale?: string;
}

// Hardcoded site info - no API calls (DEBUG)
const siteInfo: SiteInfo = {
  title: "Reaxy",
  description: "Reaxy - Next/React Kit with Headless WordPress",
  back_url: "https://reaxy.penkode.com/wp",
  front_url: "https://reaxy.penkode.com",
  light_logo: "/images/framework-logo-white.png",
  dark_logo: "/framework-logo.png",
  favicons: {
    icon_32: "",
    icon_180: "",
    icon_192: "",
    icon_512: "",
  },
  date_format: "j \\d\\e F \\d\\e Y",
  language: "es",
  social: [],
  contact: [],
  analytics: {
    google_analytics_id: "",
    facebook_pixel_id: "",
    gtm_id: "",
    twitter_pixel_id: "",
  },
  i18n: {
    default_locale: "es",
    locales: ["es", "en", "pt-br"]
  }
};

export default async function HeaderServer({
  variant = "default",
  menuVariant: menuVariantProp, // Controlled by props
  initialLocale,
}: HeaderServerProps) {
  // Handle undefined menuVariant (use responsive as default)
  const menuVariant = menuVariantProp || 'responsive';
  
  const defaultLocale = siteInfo.i18n?.default_locale || localesConfig.defaultLocale;
  const locale = initialLocale || defaultLocale;

  // Empty menus
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
