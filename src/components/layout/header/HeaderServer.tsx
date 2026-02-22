// src/components/layout/header/HeaderServer.tsx

import Header from "./Header";
import { getHeaderSiteInfo } from "@/api/headerApi";
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import localesConfig from "@/i18n/locales.generated.json";

interface HeaderServerProps {
  variant?: "default" | "home";
  menuVariant?: 'desktop' | 'mobile' | 'responsive';
  initialLocale?: string;
}

export default async function HeaderServer({
  variant = "default",
  menuVariant: menuVariantProp, // Controlled by props
  initialLocale,
}: HeaderServerProps) {
  // Handle undefined menuVariant (use responsive as default)
  const menuVariant = menuVariantProp || 'responsive';
  
  // Fetch site info using separate API to avoid circular dependency
  const siteInfo = await getHeaderSiteInfo();
  
  const defaultLocale = siteInfo.i18n?.default_locale || localesConfig.defaultLocale;
  const locale = initialLocale || defaultLocale;

  // Empty menus for now
  const menusByLocale: Record<string, MenuItem[]> = {};

  return (
    <Header 
      variant={variant}
      menuVariant={menuVariant}
      initialLocale={locale} 
      siteInfo={siteInfo as SiteInfo}
      menusByLocale={menusByLocale}
    />
  );
}
