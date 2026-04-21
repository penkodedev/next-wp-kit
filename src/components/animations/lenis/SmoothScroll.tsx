'use client';

import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scrolling wrapper using Lenis
 * Provides momentum scrolling for a premium feel.
 * Also intercepts all anchor clicks (a[href*="#"]) globally
 * so hash links scroll smoothly instead of jumping.
 */
export default function SmoothScroll({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      duration: 2.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Global anchor click interceptor for smooth scroll
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Extract the hash part (supports "#section", "/#section", "/page#section")
      const hashIndex = href.indexOf('#');
      const hash = href.slice(hashIndex);

      // Skip bare "#" (submenu toggles) and empty hashes
      if (hash === '#' || hash === '') return;

      // If href has a pathname before the hash, only smooth-scroll if we're on that page
      const pathPart = href.slice(0, hashIndex);
      if (pathPart && pathPart !== '/' && pathPart !== window.location.pathname) return;

      e.preventDefault();

      const target = document.querySelector(hash);
      if (target) {
        lenis.scrollTo(target as HTMLElement, { offset: -100 });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
    };
  }, [enabled]);

  return <>{children}</>;
}
