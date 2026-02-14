'use client';

import { useEffect } from 'react';

export default function ScrollProgress() {
  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const width = max > 0 ? (scrolled / max) * 100 : 0;
      const bar = document.getElementById('scroll-progress-bar');
      if (bar) bar.style.width = width + '%';
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div id="scroll-progress" className="scroll-progress-container">
      <div id="scroll-progress-bar" className="scroll-progress-bar" />
    </div>
  );
}
