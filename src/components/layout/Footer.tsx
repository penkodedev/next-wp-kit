// src/components/layout/Footer.tsx
import SiteInfo from "@/components/wordpress/SiteInfo";
import Image from "next/image";
import LogoFooter from "@/components/layout/LogoFooter";

export default function Footer() {
  return (
    <footer className="footer">
      {/* Usamos el componente SiteInfo como un proveedor de datos */}
      <SiteInfo>
        {(siteInfo) => (
          <>
            <LogoFooter />
            {siteInfo && (
              <div>
                &copy; {new Date().getFullYear()} {siteInfo.title}
                <br></br>
                {siteInfo.description}
                <br></br>
                {siteInfo.site_icon_url && (
                  <Image
                    src={siteInfo.site_icon_url}
                    alt="Icono del sitio"
                    width={32}
                    height={32}
                    style={{ margin: '20px auto', display: 'flex', verticalAlign: 'middle' }}
                  />
                )}
              </div>
            )}
          </>
        )}
      </SiteInfo>
    </footer>
  );
}