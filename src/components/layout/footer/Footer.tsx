// src/components/layout/footer/Footer.tsx

import SiteInfo from "@/components/wordpress/SiteInfo";
import FooterLogo from "@/components/layout/footer/FooterLogo";
import FooterCopyright from "@/components/layout/footer/FooterCopyright";
import FooterSocial from "@/components/layout/footer/FooterSocial";
import FooterContact from "@/components/layout/footer/FooterContact";
import FooterMenuClient from "@/components/layout/footer/FooterMenuClient";
import LatestPostsList from "@/components/ui/LatestPostsList";
import { fetchAPI } from "@/api/wordpressApi";
import type { MenuItem } from "@/types/wordpressTypes";
import { logger } from "@/utils/logger";
import { headers } from 'next/headers';

export default async function Footer() {
  // Get current locale from middleware header
  const headersList = headers();
  const locale = (headersList.get('x-locale') || 'es') as string;
  
  // Pre-fetch both menu versions (Spanish and English) on the server
  let menuES: MenuItem[] = [];
  let menuEN: MenuItem[] = [];

  try {
    const [menuESData, menuENData] = await Promise.all([
      fetchAPI<MenuItem[]>('/custom/v1/menus?lang=es&slug=menu-footer'),
      fetchAPI<MenuItem[]>('/custom/v1/menus?lang=en&slug=menu-footer-ingles'),
    ]);
    
    // Handle null responses (fallback to empty arrays)
    menuES = menuESData || [];
    menuEN = menuENData || [];
  } catch (error) {
    logger.error('Footer: Error pre-fetching menus', error);
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
              </div>

              <div className="footer-box footer-resources">
                <LatestPostsList postType="recursos" perPage={6} locale={locale} />
              </div>

              <div className="footer-box footer-contact">
                <FooterContact contact={siteInfo.contact} />
              </div>
            </div>

            <FooterMenuClient menuES={menuES} menuEN={menuEN} />

            <div className="copyright">
              <FooterLogo />
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
