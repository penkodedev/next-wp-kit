// src/components/layout/LogoHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

interface LogoHeaderProps {
  title: string;
  lightLogo?: string;
  darkLogo?: string;
  isHome?: boolean;
  shrink?: boolean;
}

export default function LogoHeader({ 
  title, 
  lightLogo, 
  darkLogo, 
  isHome = false, 
  shrink = false 
}: LogoHeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
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

  // Determine logo based on dark mode
  // isHome always uses lightLogo
  // Dark mode (dark background) = lightLogo (white logo to contrast)
  // Light mode (light background) = darkLogo (dark logo to contrast)
  const logoSrc = isHome 
    ? (lightLogo || '') 
    : (isDark ? (lightLogo || '') : (darkLogo || ''));

  return (
    <div id="logo-container" className={shrink ? 'logo-shrink' : ''}>
      <Link href="/" aria-label="Ir a la página principal">
        <Image
          src={logoSrc}
          alt={title || 'Logo'}
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
