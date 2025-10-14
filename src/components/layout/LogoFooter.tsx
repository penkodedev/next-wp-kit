// src/components/layout/LogoFooter.tsx
import Image from "next/image";
import SiteInfo from "@/components/wordpress/SiteInfo";

export default function LogoFooter() {
  return (
    <div className="logo-footer-wrapper">
      <SiteInfo>
        {(siteInfo) => (
          <Image
            src="/framework-logo.png"
            alt={siteInfo?.title || "Logo del sitio"} // Usamos el título del sitio o un fallback
            width={90}
            height={55}
            priority
            style={{ width: '60px', height: 'auto' }} // Ocupa el 100% de la altura del contenedor, ancho automático
          />
        )}
      </SiteInfo>
    </div>
  );
}