// src/components/layout/header/Header.tsx
"use client";

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import { useScrollShrink } from '@/hooks/useScrollShrink';
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import LogoHeader from "@/components/layout/header/LogoHeader";
import LangSwitcher from "@/components/layout/header/LangSwitcher"; 
import WpNavMenu from '@/components/navigation/WpNavMenu';
import dynamic from 'next/dynamic';
const MegaMenuHamburger = dynamic(() => import('@/components/navigation/MegaMenuHamburger'), { ssr: false });
import SearchTrigger from '@/components/features/search/SearchTrigger';
import type { SiteInfo, MenuItem } from "@/types/wordpressTypes";
import localesConfig from '@/i18n/locales.generated.json';
import Ticker from '@/components/sections/Ticker';

// Prevent re-renders of children that don't depend on scroll state
const MemoTicker = memo(Ticker);
const MemoSearchTrigger = memo(SearchTrigger);
const MemoDarkModeToggle = memo(DarkModeToggle);
const MemoLangSwitcher = memo(LangSwitcher);
const MemoWpNavMenu = memo(WpNavMenu);
const MemoMegaMenuHamburger = memo(MegaMenuHamburger);

interface HeaderProps {
  variant?: 'default' | 'home';
  menuVariant?: 'desktop' | 'mobile' | 'responsive';
  initialLocale?: string;
  siteInfo: SiteInfo;
  menusByLocale?: Record<string, MenuItem[]>;
  megaMenuEnabled?: boolean;
  currentPageId?: number;
  shrinkOnScroll?: boolean;
}

export default function Header({ 
  variant = 'default', 
  menuVariant, // Controlled by HeaderServer
  initialLocale = localesConfig.defaultLocale, 
  siteInfo,
  menusByLocale,
  megaMenuEnabled = false,
  currentPageId,

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

  const menuItems = menusByLocale?.[currentLocale];

  // Build header classes
  const headerClasses = [
    'header',
    variant === 'home' ? 'header-home' : '',
    shrinkOnScroll ? 'header-sticky-enabled' : '', // Enable sticky feature
    shouldShrink ? 'header-scrolled' : '' // Apply shrink effect when scrolled
  ].filter(Boolean).join(' ');



  return (
    <>
      <MemoTicker />
      
      <header className={headerClasses}>   
      <LogoHeader 
        title={siteInfo?.title || 'Logo'} 
        lightLogo={siteInfo?.light_logo} 
        darkLogo={siteInfo?.dark_logo} 
        isHome={isHome} 
        shrink={shouldShrink} 
      />

      <div className="actions-container">
        {megaMenuEnabled && menuItems?.length ? (
          <div className="actions-menu actions-menu--mega">
            <MemoMegaMenuHamburger menuItems={menuItems} className="main-menu" />
          </div>
        ) : (
          <div className="actions-menu actions-menu--normal">
            <MemoWpNavMenu
              location="mainnav"
              className="main-menu"
              variant={menuVariant}
              locale={currentLocale}
              menuItems={menuItems}
            />
          </div>
        )}
        <MemoSearchTrigger />
        <MemoDarkModeToggle variant="icon" size={20} strokeWidth={1.4} />
        <MemoLangSwitcher currentLocale={currentLocale} />
      </div>
      
    </header>
    </>
  );
}

