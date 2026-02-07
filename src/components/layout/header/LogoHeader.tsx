// src/components/layout/LogoHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import type { SiteInfo } from "@/types/wordpressTypes";

interface LogoHeaderProps {
  siteInfo: SiteInfo;
  isHome?: boolean; // If true, always show light_logo (for dark backgrounds)
  shrink?: boolean; // If true, apply shrink effect to logo
}

export default function LogoHeader({ siteInfo, isHome = false, shrink = false }: LogoHeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Si estamos en home, no necesitamos observar dark mode
    if (isHome) return;

    // Detectar dark mode inicial
    setIsDark(document.documentElement.classList.contains('dark-mode'));

    // Observar cambios en la clase dark-mode
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark-mode'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [isHome]);

  // Determine logo source
  // Home: ALWAYS light_logo (white, never changes)
  // Other pages: switch based on dark mode
  const logoSrc = isHome 
    ? siteInfo.light_logo 
    : (isDark ? siteInfo.light_logo : siteInfo.dark_logo);

  return (
    <div id="logo-container" className={shrink ? 'logo-shrink' : ''}>
      <Link href="/" aria-label="Ir a la página principal">
        <Image
          src={logoSrc}
          alt={siteInfo.title}
          width={90}
          height={55}
          priority
          className="logo-header"
          unoptimized
        />
      </Link>
    </div>
  );
}
