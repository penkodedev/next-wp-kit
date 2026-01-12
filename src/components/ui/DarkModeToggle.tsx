// src/components/ui/DarkModeToggle.tsx
'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';

interface DarkModeToggleProps {
  variant?: 'button' | 'select' | 'icon';
}

// Change the default variant to 'select or button'
export default function DarkModeToggle({ variant = 'select' }: DarkModeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage (ignore system preference, default is light mode)
    const stored = localStorage.getItem('darkMode');
    
    // Only activate dark mode if explicitly set to 'true' in localStorage
    const shouldBeDark = stored === 'true';
    setIsDark(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, []);

  const toggle = () => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      document.documentElement.classList.toggle('dark-mode', newValue);
      return newValue;
    });
  };

// =================================================================
//                    Button variant (icon toggle)
// =================================================================
  if (variant === 'button') {
    return (
      <a 
        onClick={toggle}
        className="dark-mode-toggle"
        aria-label={isDark ? 'Light mode' : 'Dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Icons.Sun size={22} strokeWidth={1.6} /> : <Icons.Moon size={22} strokeWidth={1.6} />}
      </a>
    );
  }

// =================================================================
//                    Icon variant (simple link)
// =================================================================
  if (variant === 'icon') {
    return (
      <a 
        onClick={toggle}
        className="dark-mode-icon"
        aria-label={isDark ? 'Light mode' : 'Dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Icons.Sun size={22} strokeWidth={1.6} /> : <Icons.Moon size={22} strokeWidth={1.6} />}
      </a>
    );
  }

    
// =================================================================
//                 Select variant (toggle switch)
// =================================================================
  return (
    <div className="dark-mode-select">
      {/* Icon on the left that changes */}
      <div className="mode-icon">
        {isDark ? <Icons.Moon size={22} strokeWidth={1.6} /> : <Icons.Sun size={22} strokeWidth={1.6} />}
      </div>
      
      {/* Toggle switch */}
      <label className="toggle-switch">
        <input 
          type="checkbox" 
          checked={isDark} 
          onChange={toggle}
          aria-label="Toggle dark mode"
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}
