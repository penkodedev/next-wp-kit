// src/components/ui/DarkModeToggle.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { getAppearanceSettings, type AppearanceSettings } from '@/api/wordpressApi';
import localesConfig from '@/i18n/locales.generated.json';

interface DarkModeToggleProps {
  variant?: 'button' | 'select' | 'icon';
  size?: number;
  strokeWidth?: number;
}

function resolveDefaultDark(defaultMode: AppearanceSettings['defaultMode']): boolean {
  if (defaultMode === 'dark') return true;
  if (defaultMode === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

export default function DarkModeToggle({ 
  variant = 'select',
  size = 22,
  strokeWidth = 1.6
}: DarkModeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const currentLocale = pathname
      ? pathname.split('/')[1] || localesConfig.defaultLocale
      : localesConfig.defaultLocale;

    getAppearanceSettings(currentLocale).then((settings) => {
      if (cancelled) return;

      if (settings && !settings.darkModeEnabled) {
        setEnabled(false);
        document.documentElement.classList.remove('dark-mode');
        return;
      }

      setEnabled(true);
      const stored = localStorage.getItem('darkMode');
      const shouldBeDark = stored !== null
        ? stored === 'true'
        : resolveDefaultDark(settings?.defaultMode ?? 'light');

      setIsDark(shouldBeDark);
      document.documentElement.classList.toggle('dark-mode', shouldBeDark);
    }).catch(() => {
      setEnabled(true);
      const stored = localStorage.getItem('darkMode');
      const shouldBeDark = stored === 'true';
      setIsDark(shouldBeDark);
      document.documentElement.classList.toggle('dark-mode', shouldBeDark);
    });

    return () => { cancelled = true; };
  }, []);

  const toggle = () => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      document.documentElement.classList.toggle('dark-mode', newValue);
      return newValue;
    });
  };

  if (enabled !== true) return null;

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
        {isDark ? <Icons.Sun size={size} strokeWidth={strokeWidth} /> : <Icons.Moon size={size} strokeWidth={strokeWidth} />}
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
        {isDark ? <Icons.Sun size={size} strokeWidth={strokeWidth} /> : <Icons.Moon size={size} strokeWidth={strokeWidth} />}
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
        {isDark ? <Icons.Moon size={size} strokeWidth={strokeWidth} /> : <Icons.Sun size={size} strokeWidth={strokeWidth} />}
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
