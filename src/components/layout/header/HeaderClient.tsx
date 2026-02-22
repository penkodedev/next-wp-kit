// src/components/layout/header/HeaderClient.tsx
"use client";

import { usePathname } from "next/navigation";
import LogoHeader from "./LogoHeader";
import WpNavMenu from "@/components/navigation/WpNavMenu";
import LangSwitcher from "@/components/layout/header/LangSwitcher";
import SearchTrigger from "@/components/features/search/SearchTrigger";
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import localesConfig from "@/i18n/locales.generated.json";

interface HeaderClientProps {
  variant?: "default" | "home";
  initialLocale: string;
  siteInfo: SiteInfo;
  menusByLocale: Record<string, MenuItem[]>;
}

export default function HeaderClient({
  variant = "default",
  initialLocale,
  siteInfo,
  menusByLocale,
}: HeaderClientProps) {
  const pathname = usePathname();

  // Detect current locale from pathname dynamically
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const currentLocale = localesConfig.supportedLocales.includes(firstSegment) 
    ? firstSegment 
    : localesConfig.defaultLocale;

  // Select the appropriate pre-fetched menu based on locale
  const menuItems = menusByLocale[currentLocale] || [];

  return (
    <header className={`header ${variant === "home" ? "header-home" : ""}`}>
      <LogoHeader 
        title={siteInfo?.title || 'Logo'} 
        lightLogo={siteInfo?.light_logo} 
        darkLogo={siteInfo?.dark_logo} 
      />
      <WpNavMenu 
        location="mainnav" 
        className="main-menu" 
        locale={currentLocale}
        menuItems={menuItems}
        variant="desktop"
      />
      <LangSwitcher currentLocale={currentLocale} />
      <SearchTrigger />
    </header>
  );
}