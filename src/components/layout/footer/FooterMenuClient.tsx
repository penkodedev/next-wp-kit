// src/components/layout/footer/FooterMenuClient.tsx
"use client";

import { usePathname } from "next/navigation";
import WpNavMenu from "@/components/wordpress/WpNavMenu";
import type { MenuItem } from "@/types/wordpressTypes";
import localesConfig from "@/i18n/locales.generated.json";

type FooterMenuClientProps = {
  menusByLocale: Record<string, MenuItem[]>;
};

export default function FooterMenuClient({ menusByLocale }: FooterMenuClientProps) {
  const pathname = usePathname();

  // Detect current locale from pathname dynamically
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const currentLocale = localesConfig.supportedLocales.includes(firstSegment) 
    ? firstSegment 
    : localesConfig.defaultLocale;

  // Select the appropriate pre-fetched menu based on locale
  const menuSlug = `menu-footer${currentLocale !== localesConfig.defaultLocale ? `-${currentLocale}` : ''}`;
  const menuItems = menusByLocale[currentLocale] || [];

  return (
    <WpNavMenu 
      slug={menuSlug} 
      className="footer-menu-nav" 
      locale={currentLocale}
      menuItems={menuItems}
    />
  );
}
