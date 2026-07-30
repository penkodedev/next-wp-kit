'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  const updateProgress = useCallback(() => {
    const bar = barRef.current;
    if (!bar) return;
    
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const width = max > 0 ? (scrolled / max) * 100 : 0;
    
    bar.style.width = `${width}%`;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, [updateProgress]);

  return (
    <div id="scroll-progress" className="scroll-progress-container">
      <div ref={barRef} id="scroll-progress-bar" className="scroll-progress-bar" />
    </div>
  );
}