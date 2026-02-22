// src/components/layout/header/LogoHeaderServer.tsx

import LogoHeader from "./LogoHeader";
import { safeGetSiteInfo } from "@/api/wordpressApi";
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
    light_logo: "",
    dark_logo: "",
    favicons: {
      icon_32: '',
      icon_180: '',
      icon_192: '',
      icon_512: '',
    },
    date_format: "",
    language: "",
    social: [],
    contact: [],
    analytics: {
      google_analytics_id: '',
      facebook_pixel_id: '',
      gtm_id: '',
      twitter_pixel_id: '',
    },
    i18n: {
      default_locale: "",
      locales: []
    }
  };

  // Fetch site info with error handling
  const fetchedSiteInfo = await safeGetSiteInfo();
  siteInfo = fetchedSiteInfo || defaultSiteInfo;

  return (
    <LogoHeader 
      title={siteInfo?.title || 'Logo'} 
      lightLogo={siteInfo?.light_logo} 
      darkLogo={siteInfo?.dark_logo} 
    />
  );
}