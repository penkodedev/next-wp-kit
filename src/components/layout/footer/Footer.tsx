// src/components/layout/footer/Footer.tsx

import FooterLogo from "@/components/layout/footer/FooterLogo";
import FooterCopyright from "@/components/layout/footer/FooterCopyright";
import FooterSocial from "@/components/layout/footer/FooterSocial";
import FooterContact from "@/components/layout/footer/FooterContact";
import FooterMenuClient from "@/components/layout/footer/FooterMenuClient";
import LatestPostsList from "@/components/sections/LatestPostsList";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { fetchAPI, safeGetSiteInfo } from "@/api/wordpressApi";
import type { MenuItem, MenuResponse } from "@/types/wordpressTypes";
import { logger } from "@/utils/wordpress/logger";
import { headers } from 'next/headers';
import localesConfig from "@/i18n/locales.generated.json";

// Fetch data directly to avoid circular dependency with SiteInfo component
async function getFooterData(locale: string) {
  const [siteInfo, menuData] = await Promise.all([
    safeGetSiteInfo(locale),
    fetchAPI<MenuResponse>('/custom/v1/menus?lang=' + locale + '&location=footernav').catch(() => null)
  ]);
  const menuItems = menuData?.items ?? [];

  return {
    title: siteInfo?.title || 'Next WP Kit',
    lightLogo: siteInfo?.light_logo || '',
    darkLogo: siteInfo?.dark_logo || '',
    social: siteInfo?.social || [],
    contact: siteInfo?.contact || [],
    menu: menuItems
  };
}

export default async function Footer() {
  // Get current locale from middleware header
  const headersList = headers();
  const locale = (headersList.get('x-locale') || localesConfig.defaultLocale) as string;
  
  // Fetch footer data directly (avoiding SiteInfo component to prevent circular deps)
  const footerData = await getFooterData(locale);

  // Pre-fetch menus for ALL active locales dynamically
  const menusByLocale: Record<string, MenuItem[]> = {};

  try {
    // Fetch menus for all locales in parallel using LOCATION (same as header)
    const menuPromises = localesConfig.supportedLocales.map(async (localeKey) => {
      try {
        const res = await fetchAPI<MenuResponse>(`/custom/v1/menus?lang=${localeKey}&location=footernav`);
        return { locale: localeKey, menu: res?.items ?? [] };
      } catch (err) {
  logger.error(`Error fetching footer menu for ${localeKey}:`, err as Error);
        return { locale: localeKey, menu: [] };
      }
    });

    const menuResults = await Promise.all(menuPromises);
    
    // Organize menus by locale
    menuResults.forEach(result => {
      menusByLocale[result.locale] = result.menu;
    });
  } catch (error) {
  logger.error('Footer: Error pre-fetching menus', error as Error);
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-box footer-social">
          <FooterSocial social={footerData.social} />
          {/* <DarkModeToggle variant="select" /> */}
        </div>

        <div className="footer-box footer-resources">
          <LatestPostsList postType="recursos" perPage={6} locale={locale} />
        </div>

        <div className="footer-box footer-contact">
          <FooterContact contact={footerData.contact} />
        </div>
      </div>

      <FooterMenuClient menusByLocale={menusByLocale} />

      <div className="copyright">
        <FooterLogo 
          title={footerData.title}
          lightLogo={footerData.lightLogo}
          darkLogo={footerData.darkLogo}
        />
        <FooterCopyright
          title={footerData.title}
          showTitle
          showDescription
        />
      </div>
    </footer>
  );
}
