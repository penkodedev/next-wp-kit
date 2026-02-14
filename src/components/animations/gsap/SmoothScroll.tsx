'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { ScrollSmoother } from './gsap';

/**
 * Smooth scrolling wrapper using GSAP ScrollSmoother
 * Requires specific DOM structure: wrapper > content
 */
export default function GsapSmoothScroll({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    // Create ScrollSmoother with wrapper and content
    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1.2,
      effects: true,
    });

    return () => {
      smoother.kill();
    };
  }, []);

  return (
    <div ref={wrapperRef} id="smooth-wrapper">
      <div ref={contentRef} id="smooth-content">
        {children}
      </div>
    </div>
  );
}
