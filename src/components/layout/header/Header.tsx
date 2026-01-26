// src/components/layout/header/Header.tsx
"use client";

import { usePathname } from 'next/navigation';
import { useScrollShrink } from '@/hooks/useScrollShrink';
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import LogoHeader from "@/components/layout/header/LogoHeader";
import LangSwitcher from "@/components/layout/header/LangSwitcher"; 
import WpNavMenu from '@/components/navigation/WpNavMenu';
import SearchTrigger from '@/components/features/search/SearchTrigger';
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import localesConfig from '@/i18n/locales.generated.json';

interface HeaderProps {
  variant?: 'default' | 'home';
  menuVariant?: 'desktop' | 'mobile' | 'responsive';
  initialLocale?: string;
  siteInfo: SiteInfo;
  menusByLocale?: Record<string, MenuItem[]>;

  shrinkOnScroll?: boolean;
}

export default function Header({ 
  variant = 'default', 
  menuVariant = 'responsive',
  initialLocale = localesConfig.defaultLocale, 
  siteInfo,
  menusByLocale,


  // =================================================================
  // ENABLE/DISABLE SHRINK EFFECT HERE ↓
  // =================================================================
  shrinkOnScroll = true, // Change to 'false' to disable sticky shrink effect, 'true' to enable
}: HeaderProps) {
  const pathname = usePathname();


  // =================================================================
  // SHRINK EFFECT HOOK
  // Detects when user scrolls past 100px threshold
  // Only active if shrinkOnScroll prop is true
  // =================================================================
  const isScrolled = useScrollShrink(100); // 100px scroll threshold
  const shouldShrink = shrinkOnScroll && isScrolled;

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

  // Build header classes
  const headerClasses = [
    'header',
    variant === 'home' ? 'header-home' : '',
    shrinkOnScroll ? 'header-sticky-enabled' : '', // Enable sticky feature
    shouldShrink ? 'header-scrolled' : '' // Apply shrink effect when scrolled
  ].filter(Boolean).join(' ');



  return (
    <header className={headerClasses}>   
      <LogoHeader siteInfo={siteInfo} isHome={isHome} shrink={shouldShrink} />

      <div className="actions-container">
        <WpNavMenu 
          location="mainnav" 
          className="main-menu" 
          locale={currentLocale}
          menuItems={menuItems}
          variant={menuVariant}
        />
        <DarkModeToggle variant="icon" size={20} strokeWidth={1.4} />
        <SearchTrigger />
        <LangSwitcher currentLocale={currentLocale} />
        
      </div>
      
    </header>
  );
}
