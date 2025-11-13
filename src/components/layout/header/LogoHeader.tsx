// src/components/layout/LogoHeader.tsx

import Image from "next/image";
import Link from "next/link";
import type { SiteInfo } from "@/types/wordpressTypes";

interface LogoHeaderProps {
  siteInfo: SiteInfo;
}

export default function LogoHeader({ siteInfo }: LogoHeaderProps) {
  return (
    <div id="logo-container">
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
    </div>
  );
}
