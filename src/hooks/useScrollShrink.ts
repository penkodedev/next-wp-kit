// src/hooks/useScrollShrink.ts
'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect if user has scrolled past a threshold.
 * Uses a ref gate so setState is only called when the value actually changes,
 * avoiding ~30-60 unnecessary setter calls per second during active scrolling.
 */
export function useScrollShrink(threshold: number = 100): boolean {
  const [isScrolled, setIsScrolled] = useState(false);
  const prev = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrolled = window.scrollY > threshold;
      if (scrolled !== prev.current) {
        prev.current = scrolled;
        setIsScrolled(scrolled);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}
