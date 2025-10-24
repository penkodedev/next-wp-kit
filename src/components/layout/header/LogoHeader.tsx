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
              src={siteInfo.dark_logo}
              alt={siteInfo.title}
              width={90}
              height={55}
              priority
              className="logo-header"
              unoptimized // Disable Next.js image optimization for now
            />
          </Link>
        )}
      </SiteInfo>
    </div>
  );
}
