// src/components/layout/header/LangSwitcher.tsx
// 
"use client";

import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { useState, useEffect } from 'react';
import { getWpmlTranslation, getWpmlLanguages, type WpmlLanguage } from '@/api/wordpressApi';
import { useWpPageId } from '@/utils/wordpress/WpPageIdContext';
import { CPT_SLUG_MAP, getTranslatedCptSlug } from '@/utils/config/cptConfig';
import { shouldPreserveOnLanguageSwitch } from '@/utils/config/frontendPagesConfig';

interface LangSwitcherProps {
  currentLocale: string;
}

export default function LangSwitcher({ currentLocale }: LangSwitcherProps) {
  const pathname = usePathname();
  const { pageId } = useWpPageId();
  const [languages, setLanguages] = useState<WpmlLanguage[]>([]);
  const [defaultLang, setDefaultLang] = useState('es');
  const [translatedUrls, setTranslatedUrls] = useState<Record<string, string>>({});

  // Fetch available languages from WordPress
  useEffect(() => {
    getWpmlLanguages().then(data => {
      setLanguages(data.languages);
      setDefaultLang(data.default);
    });
  }, []);

  // Clear translations when pathname changes
  useEffect(() => {
    // CRITICAL: Always clear translations when pathname changes
    // This ensures archive pages (without pageId) don't show stale URLs
    setTranslatedUrls({});
  }, [pathname]);

  // Fetch translations for current page
  useEffect(() => {
    // Early return for archive pages - they don't have pageId, so no WPML translations
    if (!pageId || languages.length === 0) return;

    const currentPageId = pageId;

    async function fetchTranslations() {
      const urls: Record<string, string> = {};
      for (const lang of languages) {
        if (lang.code === currentLocale) {
          urls[lang.code] = pathname;
        } else {
          const translation = await getWpmlTranslation(currentPageId, lang.code);
          urls[lang.code] = translation?.url || (lang.code === defaultLang ? '/' : `/${lang.code}`);
        }
      }
      setTranslatedUrls(urls);
    }
    fetchTranslations();
  }, [pageId, currentLocale, languages, defaultLang, pathname]);

  function getRouteSegments() {
    const segments = pathname.split('/').filter(Boolean);
    const languageCodes = languages.map(l => l.code);
    const hasLocalePrefix = languageCodes.includes(segments[0]);
    return hasLocalePrefix ? segments.slice(1) : segments;
  }

  function isHomePath() {
    return pathname === '/' || pathname === '/es' || pathname === '/en';
  }

  function withLocalePrefix(path: string, targetLang: string) {
    return targetLang === defaultLang ? path : `/${targetLang}${path}`;
  }

  function buildLanguageUrl(targetLang: string): string {
    // If we have pageId AND translated URLs from WPML API, use them
    // CRITICAL: Only use translatedUrls if we have a pageId (single posts/pages)
    // For archives (no pageId), we must construct the URL manually
    if (pageId && translatedUrls[targetLang]) {
      return translatedUrls[targetLang];
    }
    
    // Handle home page
    if (isHomePath()) {
      return targetLang === defaultLang ? '/' : `/${targetLang}`;
    }
    
    // Parse current pathname
    const routeSegments = getRouteSegments();
    
    if (routeSegments.length === 0) {
      return targetLang === defaultLang ? '/' : `/${targetLang}`;
    }
    
    const mainSlug = routeSegments[0];
    
    // Check if this is a CPT archive or single
    const internalCptSlug = CPT_SLUG_MAP[mainSlug];
    
    if (internalCptSlug) {
      // Translate the CPT slug
      const translatedSlug = getTranslatedCptSlug(internalCptSlug, targetLang);
      const restOfPath = routeSegments.slice(1).join('/');
      const fullPath = restOfPath ? `/${translatedSlug}/${restOfPath}` : `/${translatedSlug}`;
      
      // Add locale prefix only for non-default languages
      return withLocalePrefix(fullPath, targetLang);
    }
    
    // Handle frontend-only pages (dynamic, from config)
    if (shouldPreserveOnLanguageSwitch(mainSlug)) {
      const fullPath = `/${mainSlug}`;
      return withLocalePrefix(fullPath, targetLang);
    }
    
    // For regular pages (non-CPT), we can't translate without pageId, so fallback to home
    return targetLang === defaultLang ? '/' : `/${targetLang}`;
  }

  if (languages.length === 0) return null;

  // Get current language info
  const currentLang = languages.find(lang => lang.code === currentLocale);
  const otherLanguages = languages.filter(lang => lang.code !== currentLocale);

  return (
    <div className="lang-switcher-simple">
      <Icons.Globe size={20} strokeWidth={1.1} className="lang-icon" />
      <span className="current-lang">
        {currentLang?.code.toUpperCase() || currentLocale.toUpperCase()}
      </span>
      
      {/* Dropdown with other languages */}
      {otherLanguages.length > 0 && (
        <div className="lang-dropdown">
          {otherLanguages.map((lang) => {
            const href = buildLanguageUrl(lang.code);
            return (
              <a
                key={lang.code} 
                href={href}
                onClick={(e) => { 
                  e.preventDefault(); 
                  window.location.href = href;
                }}
                className="lang-link" 
                aria-label={`Switch to ${lang.name}`}
              >
                {lang.code.toUpperCase()}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
