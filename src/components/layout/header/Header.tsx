// src/components/layout/header/Header.tsx
"use client";

import { usePathname } from 'next/navigation';
import LogoHeaderServer from "@/components/layout/header/LogoHeaderServer";
import LangSwitcher from "@/components/layout/header/LangSwitcher"; 
import WpNavMenu from '@/components/wordpress/WpNavMenu';
import SearchTrigger from '@/components/features/search/SearchTrigger';
import type { SiteInfo } from "@/types/wordpressTypes";
import localesConfig from '@/i18n/locales.generated.json';

interface HeaderProps {
  variant?: 'default' | 'home';
  initialLocale?: string;
  siteInfo: SiteInfo;
}

export default function Header({ variant = 'default', initialLocale = localesConfig.defaultLocale, siteInfo }: HeaderProps) {
  const pathname = usePathname();

  // Detectar el locale actual del pathname
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const currentLocale = localesConfig.supportedLocales.includes(firstSegment)
    ? firstSegment
    : localesConfig.defaultLocale;

  return (
    <header className={`header ${variant === 'home' ? 'header-home' : ''}`}>
      {variant === 'home' ? <LogoHeaderServer siteInfo={siteInfo} /> : <LogoHeaderServer siteInfo={siteInfo} />}
      <WpNavMenu location="mainnav" className="main-menu" locale={currentLocale} />
      <LangSwitcher currentLocale={currentLocale} />
      <SearchTrigger />
    </header>
  );
}
