// src/components/layout/header/Header.tsx
"use client";

import { usePathname } from 'next/navigation';
import LogoHeader from "@/components/layout/header/LogoHeader";
import LangSwitcher from "@/components/layout/header/LangSwitcher"; 
import WpNavMenu from '@/components/wordpress/WpNavMenu';
import SearchTrigger from '@/components/features/search/SearchTrigger';
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import localesConfig from '@/i18n/locales.generated.json';

interface HeaderProps {
  variant?: 'default' | 'home';
  menuVariant?: 'desktop' | 'mobile' | 'responsive';
  initialLocale?: string;
  siteInfo: SiteInfo;
  menusByLocale?: Record<string, MenuItem[]>;
}

export default function Header({ 
  variant = 'default', 
  menuVariant = 'responsive',
  initialLocale = localesConfig.defaultLocale, 
  siteInfo,
  menusByLocale
}: HeaderProps) {
  const pathname = usePathname();

  // Detectar el locale actual del pathname
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const currentLocale = localesConfig.supportedLocales.includes(firstSegment)
    ? firstSegment
    : localesConfig.defaultLocale;

  // Detect if we're on home page
  const isHome = pathname === '/' || pathname === `/${currentLocale}`;

  // Get pre-fetched menu for current locale (if available)
  const menuItems = menusByLocale?.[currentLocale];

  return (
    <header className={`header ${variant === 'home' ? 'header-home' : ''}`}>
      <LogoHeader siteInfo={siteInfo} isHome={isHome} />
      <WpNavMenu 
        location="mainnav" 
        className="main-menu" 
        locale={currentLocale}
        menuItems={menuItems}
        variant={menuVariant}
      />
      <LangSwitcher currentLocale={currentLocale} />
      <SearchTrigger />
    </header>
  );
}
