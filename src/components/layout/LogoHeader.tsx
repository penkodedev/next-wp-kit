// src/components/layout/LogoHeader.tsx

import Image from "next/image";
import Link from "next/link";
import SiteInfo from "@/components/wordpress/SiteInfo";

export default function LogoHeader() {
  return (
    <div id="logo-container">
      <SiteInfo>
        {(siteInfo) => (
          <Link href="/" aria-label="Ir a la página principal">
            <Image
              src="/framework-logo.png"
              alt={siteInfo?.title || "Logo del sitio"}
              width={90}
              height={55}
              priority
              className="logo-header"
              style={{ width: '100%', height: 'auto' }} // Ocupa el 100% del ancho del contenedor, altura automática
            />
          </Link>
        )}
      </SiteInfo>
    </div>
  );
}
