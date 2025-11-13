// src/components/layout/footer/FooterMenuClient.tsx
"use client";

import { usePathname } from "next/navigation";
import WpNavMenu from "@/components/wordpress/WpNavMenu";
import type { MenuItem } from "@/types/wordpressTypes";

type FooterMenuClientProps = {
  menuES: MenuItem[];
  menuEN: MenuItem[];
};

export default function FooterMenuClient({ menuES, menuEN }: FooterMenuClientProps) {
  const pathname = usePathname();

  // Detect current locale from pathname
  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments.length > 0 && segments[0] === "en" ? "en" : "es";

  // Select the appropriate pre-fetched menu based on locale
  const menuSlug = currentLocale === "en" ? "menu-footer-ingles" : "menu-footer";
  const menuItems = currentLocale === "en" ? menuEN : menuES;

  return (
    <WpNavMenu 
      slug={menuSlug} 
      className="footer-menu-nav" 
      locale={currentLocale}
      menuItems={menuItems}
    />
  );
}
