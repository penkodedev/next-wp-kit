// src/components/layout/header/LogoHeaderServer.tsx

import LogoHeader from "./LogoHeader";
import { getSiteInfo } from "@/api/wordpressApi";
import type { SiteInfo } from "@/types/wordpressTypes";

interface LogoHeaderServerProps {
  siteInfo: SiteInfo;
}

export default async function LogoHeaderServer({ siteInfo }: LogoHeaderServerProps) {
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
      locales: []
    }
  };

  const fetchedSiteInfo = await getSiteInfo();
  siteInfo = fetchedSiteInfo || defaultSiteInfo;

  return <LogoHeader siteInfo={siteInfo} />;
}