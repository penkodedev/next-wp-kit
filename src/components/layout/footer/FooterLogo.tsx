// src/components/layout/footer/FooterLogo.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import type { SiteInfo } from "@/types/wordpressTypes";

interface FooterLogoProps {
  siteInfo: SiteInfo;
}

export default function FooterLogo({ siteInfo }: FooterLogoProps) {
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

  return (
    <div className="logo-footer-wrapper">
      <Image
        src={isDark ? siteInfo.light_logo : siteInfo.dark_logo}
        alt={siteInfo?.title || "Logo del sitio"}
        width={90}
        height={55}
        priority
        style={{ width: '60px', height: 'auto' }}
        unoptimized
      />
    </div>
  );
}
