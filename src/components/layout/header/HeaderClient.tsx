// src/components/layout/header/HeaderClient.tsx
"use client";

import { usePathname } from "next/navigation";
import LogoHeader from "./LogoHeader";
import WpNavMenu from "@/components/wordpress/WpNavMenu";
import LangSwitcher from "@/components/layout/header/LangSwitcher";
import SearchTrigger from "@/components/features/search/SearchTrigger";
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";

interface HeaderClientProps {
  variant?: "default" | "home";
  initialLocale?: string;
  siteInfo: SiteInfo;
  menuES: MenuItem[];
  menuEN: MenuItem[];
}

export default function HeaderClient({
  variant = "default",
  initialLocale = "es",
  siteInfo,
  menuES,
  menuEN,
}: HeaderClientProps) {
  const pathname = usePathname();

  // Detect current locale from pathname
  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments.length > 0 && segments[0] === "en" ? "en" : "es";

  // Select the appropriate pre-fetched menu based on locale
  const menuItems = currentLocale === "en" ? menuEN : menuES;

  return (
    <header className={`header ${variant === "home" ? "header-home" : ""}`}>
      <LogoHeader siteInfo={siteInfo} />
      <WpNavMenu 
        location="mainnav" 
        className="main-menu" 
        locale={currentLocale}
        menuItems={menuItems}
      />
      <LangSwitcher currentLocale={currentLocale} />
      <SearchTrigger />
    </header>
  );
}