// src/components/layout/header/HeaderServer.tsx

import HeaderClient from "./HeaderClient";
import { getSiteInfo } from "@/api/wordpressApi";
import type { SiteInfo } from "@/types/wordpressTypes";

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

  const siteInfo = (await getSiteInfo()) || defaultSiteInfo;

  return <HeaderClient variant={variant} initialLocale={initialLocale} siteInfo={siteInfo} />;
}