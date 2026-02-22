// src/components/layout/footer/FooterLogo.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";

interface FooterLogoProps {
  title?: string;
  lightLogo?: string;
  darkLogo?: string;
}

export default function FooterLogo({ title, lightLogo, darkLogo }: FooterLogoProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
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
  }, []);

  // Determine logo based on dark mode
  // Dark mode (dark background) = lightLogo (white logo to contrast)
  // Light mode (light background) = darkLogo (dark logo to contrast)
  const logoSrc = isDark 
    ? (lightLogo || '/icons/logo.svg') 
    : (darkLogo || '/icons/logo.svg');

  return (
    <div className="logo-footer-wrapper">
      <Image
        src={logoSrc}
        alt={title || "Logo del sitio"}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/icons/logo.svg';
        }}
        width={90}
        height={55}
        priority
        style={{ width: '60px', height: 'auto' }}
        unoptimized
      />
    </div>
  );
}
