'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { ScrollSmoother } from './gsap';

/**
 * Smooth scrolling wrapper using GSAP ScrollSmoother
 * Requires specific DOM structure: wrapper > content
 * With effects: true, parallax can be added via data-speed attribute
 */
export default function GsapScrollSmoother({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    // Create ScrollSmoother with wrapper and content
    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1,
      effects: true, // enables data-speed and data-lag attributes
      smoothTouch: 0.1,
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
