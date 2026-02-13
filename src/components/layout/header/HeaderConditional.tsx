import Header from '@/components/layout/header/Header';
import { safeGetSiteInfo } from '@/api/wordpressApi';
import type { SiteInfo } from '@/types/wordpressTypes';

interface HeaderConditionalProps {
  currentLocale?: string;
}

// Fallback site info when WordPress is unavailable
const FALLBACK_SITE_INFO: SiteInfo = {
  title: 'Next WP Kit',
  description: 'Website',
  back_url: '/',
  front_url: '/',
  light_logo: '',
  dark_logo: '',
  favicons: {
    icon_32: '',
    icon_180: '',
    icon_192: '',
    icon_512: '',
  },
  date_format: 'F j, Y',
  language: 'es',
  social: [],
  contact: [],
  analytics: {
    google_analytics_id: '',
    facebook_pixel_id: '',
    gtm_id: '',
    twitter_pixel_id: '',
  },
  i18n: {
    default_locale: 'es',
    locales: ['es'],
  },
};

export default async function HeaderConditional({ currentLocale = 'es' }: HeaderConditionalProps) {
  // Fetch site info for the header (safe version)
  const siteInfo = await safeGetSiteInfo();
  
  return <Header variant="default" siteInfo={siteInfo} />;
}
