// src/components/layout/footer/Footer.tsx

import FooterLogo from "@/components/layout/footer/FooterLogo";
import FooterCopyright from "@/components/layout/footer/FooterCopyright";
import FooterSocial from "@/components/layout/footer/FooterSocial";
import FooterContact from "@/components/layout/footer/FooterContact";
import FooterMenuClient from "@/components/layout/footer/FooterMenuClient";
import LatestPostsList from "@/components/sections/LatestPostsList";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { fetchMenuByLocation } from "@/api/wordpressApi";
import type { SiteInfo, MenuItem, MenuResponse } from "@/types/wordpressTypes";
import { logger } from "@/utils/wordpress/logger";
import { headers } from 'next/headers';
import localesConfig from "@/i18n/locales.generated.json";

async function getFooterData(locale: string, siteInfo?: SiteInfo) {
  const menuData = await fetchMenuByLocation('footernav', locale).catch(() => null);
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

export default async function Footer({ siteInfo }: { siteInfo?: SiteInfo }) {
  const headersList = headers();
  const locale = (headersList.get('x-locale') || localesConfig.defaultLocale) as string;
  
  const footerData = await getFooterData(locale, siteInfo);

  const menusByLocale: Record<string, MenuItem[]> = {};

  try {
    const menuPromises = localesConfig.supportedLocales.map(async (localeKey) => {
      try {
        const res = await fetchMenuByLocation('footernav', localeKey);
        return { locale: localeKey, menu: res?.items ?? [] };
      } catch (err) {
        logger.error(`Error fetching footer menu for ${localeKey}:`, err as Error);
        return { locale: localeKey, menu: [] };
      }
    });

    const menuResults = await Promise.all(menuPromises);
    
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
