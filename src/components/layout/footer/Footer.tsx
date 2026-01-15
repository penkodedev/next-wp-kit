// src/components/layout/footer/Footer.tsx

import SiteInfo from "@/components/wordpress/SiteInfo";
import FooterLogo from "@/components/layout/footer/FooterLogo";
import FooterCopyright from "@/components/layout/footer/FooterCopyright";
import FooterSocial from "@/components/layout/footer/FooterSocial";
import FooterContact from "@/components/layout/footer/FooterContact";
import FooterMenuClient from "@/components/layout/footer/FooterMenuClient";
import LatestPostsList from "@/components/sections/LatestPostsList";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { fetchAPI } from "@/api/wordpressApi";
import type { MenuItem } from "@/types/wordpressTypes";
import { logger } from "@/utils/wordpress/logger";
import { headers } from 'next/headers';
import localesConfig from "@/i18n/locales.generated.json";

export default async function Footer() {
  // Get current locale from middleware header
  const headersList = headers();
  const locale = (headersList.get('x-locale') || localesConfig.defaultLocale) as string;
  
  // Pre-fetch menus for ALL active locales dynamically
  const menusByLocale: Record<string, MenuItem[]> = {};

  try {
    // Fetch menus for all locales in parallel using LOCATION (same as header)
    const menuPromises = localesConfig.supportedLocales.map(async (localeKey) => {
      try {
        // Use footer location - WPML will handle translation via icl_object_id
        const menu = await fetchAPI<MenuItem[]>(`/custom/v1/menus?lang=${localeKey}&location=footernav`);
        return { locale: localeKey, menu: menu || [] };
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
      {/* Usamos el componente SiteInfo como un proveedor de datos */}
      <SiteInfo>
        {(siteInfo) => (
          <>
            <div className="footer-content">
              <div className="footer-box footer-social">
                <FooterSocial social={siteInfo.social} />
                <DarkModeToggle variant="select" />
              </div>

              <div className="footer-box footer-resources">
                <LatestPostsList postType="recursos" perPage={6} locale={locale} />
              </div>

              <div className="footer-box footer-contact">
                <FooterContact contact={siteInfo.contact} />
              </div>
            </div>

            <FooterMenuClient menusByLocale={menusByLocale} />

            <div className="copyright">
              <FooterLogo siteInfo={siteInfo} />
              <FooterCopyright
                title={siteInfo.title}
                description={siteInfo.description}
              />
            </div>
          </>
        )}
      </SiteInfo>
    </footer>
  );
}
