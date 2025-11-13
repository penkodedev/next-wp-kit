// src/components/layout/footer/FooterMenuClient.tsx
"use client";

import { usePathname } from "next/navigation";
import WpNavMenu from "@/components/wordpress/WpNavMenu";

export default function FooterMenuClient() {
  const pathname = usePathname();

  // Detectar el locale actual del pathname
  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments.length > 0 && segments[0] === "en" ? "en" : "es";

  // Determinar el slug del menú según el idioma actual
  const menuSlug = currentLocale === "en" ? "menu-footer-ingles" : "menu-footer";

  return <WpNavMenu slug={menuSlug} className="footer-menu-nav" locale={currentLocale} />;
}
