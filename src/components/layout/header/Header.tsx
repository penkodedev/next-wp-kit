// src/components/layout/header/Header.tsx
"use client";

import { usePathname } from 'next/navigation';
import LogoHeaderServer from "@/components/layout/header/LogoHeaderServer";
import LangSwitcher from "@/components/layout/header/LangSwitcher"; 
import WpNavMenu from '@/components/wordpress/WpNavMenu';
import SearchTrigger from '@/components/features/search/SearchTrigger';
import type { SiteInfo } from "@/types/wordpressTypes";

interface HeaderProps {
  variant?: 'default' | 'home';
  initialLocale?: string;
  siteInfo: SiteInfo;
}

export default function Header({ variant = 'default', initialLocale = 'es', siteInfo }: HeaderProps) {
  const pathname = usePathname();

  // Detectar el locale actual del pathname
  // Si la ruta comienza con /en, es inglés; de lo contrario, es español
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = (segments.length > 0 && segments[0] === 'en') ? 'en' : 'es';

  return (
    <header className={`header ${variant === 'home' ? 'header-home' : ''}`}>
      {variant === 'home' ? <LogoHeaderServer siteInfo={siteInfo} /> : <LogoHeaderServer siteInfo={siteInfo} />}
      <WpNavMenu location="mainnav" className="main-menu" locale={currentLocale} />
      <LangSwitcher currentLocale={currentLocale} />
      <SearchTrigger />
    </header>
  );
}
