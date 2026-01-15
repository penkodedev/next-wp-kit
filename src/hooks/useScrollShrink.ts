// src/hooks/useScrollShrink.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if user has scrolled past a threshold
 * @param threshold - Scroll position in pixels to trigger the shrink effect (default: 100)
 * @returns isScrolled - Boolean indicating if scrolled past threshold
 */
export function useScrollShrink(threshold: number = 100): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > threshold);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}
