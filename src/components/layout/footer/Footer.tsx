// src/components/layout/footer/Footer.tsx
import SiteInfo from "@/components/wordpress/SiteInfo";
import FooterLogo from "@/components/layout/footer/FooterLogo";
import FooterCopyright from "@/components/layout/footer/FooterCopyright";
import FooterSocial from "@/components/layout/footer/FooterSocial";
import FooterContact from "@/components/layout/footer/FooterContact";
import FooterMenu from "@/components/layout/footer/FooterMenu";
import FooterLastPosts from "@/components/layout/footer/FooterLastPosts";

export default function Footer() {
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
                <FooterLastPosts />
              </div>

              <div className="footer-box footer-contact">
                <FooterContact contact={siteInfo.contact} />
              </div>
            </div>

            <div className="footer-menu">
              <FooterMenu />
            </div>

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
