// src/components/layout/header/HeaderClient.tsx
"use client";

import { usePathname } from "next/navigation";
import LogoHeader from "./LogoHeader";
import WpNavMenu from "@/components/wordpress/WpNavMenu";
import LangSwitcher from "@/components/layout/header/LangSwitcher";
import SearchTrigger from "@/components/ui/SearchTrigger";
import type { SiteInfo } from "@/types/wordpressTypes";

interface HeaderClientProps {
  variant?: "default" | "home";
  initialLocale?: string;
  siteInfo: SiteInfo;
}

export default function HeaderClient({
  variant = "default",
  initialLocale = "es",
  siteInfo,
}: HeaderClientProps) {
  const pathname = usePathname();

  // Detectar el locale actual del pathname
  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments.length > 0 && segments[0] === "en" ? "en" : "es";

  return (
    <header className={`header ${variant === "home" ? "header-home" : ""}`}>
      <LogoHeader siteInfo={siteInfo} />
      <WpNavMenu location="mainnav" className="main-menu" locale={currentLocale} />
      <LangSwitcher currentLocale={currentLocale} />
      <SearchTrigger />
    </header>
  );
}