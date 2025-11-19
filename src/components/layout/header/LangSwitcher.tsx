// src/components/layout/header/LangSwitcher.tsx
// 
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { useState, useEffect } from 'react';
import { getWpmlTranslation, getWpmlLanguages, type WpmlLanguage } from '@/api/wordpressApi';
import { useWpPageId } from '@/utils/WpPageIdContext';
import { CPT_SLUG_MAP, getTranslatedCptSlug } from '@/utils/cptConfig';
import { shouldPreserveOnLanguageSwitch } from '@/utils/frontendPagesConfig';

interface LangSwitcherProps {
  currentLocale: string;
}

export default function LangSwitcher({ currentLocale }: LangSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
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

  // Fetch translations for current page
  useEffect(() => {
    // CRITICAL: Always clear translations when pathname changes
    // This ensures archive pages (without pageId) don't show stale URLs
    setTranslatedUrls({});
    
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
  }, [pathname, pageId, currentLocale, languages, defaultLang]); // pathname FIRST to trigger clearing

  function buildLanguageUrl(targetLang: string): string {
    // If we have pageId AND translated URLs from WPML API, use them
    // CRITICAL: Only use translatedUrls if we have a pageId (single posts/pages)
    // For archives (no pageId), we must construct the URL manually
    if (pageId && translatedUrls[targetLang]) {
      return translatedUrls[targetLang];
    }
    
    // Handle home page
    if (pathname === '/' || pathname === '/es' || pathname === '/en') {
      return targetLang === defaultLang ? '/' : `/${targetLang}`;
    }
    
    // Parse current pathname
    const segments = pathname.split('/').filter(Boolean);
    const languageCodes = languages.map(l => l.code);
    
    // Remove locale prefix if present (e.g., /en/news -> [news])
    const hasLocalePrefix = languageCodes.includes(segments[0]);
    const routeSegments = hasLocalePrefix ? segments.slice(1) : segments;
    
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
      return targetLang === defaultLang ? fullPath : `/${targetLang}${fullPath}`;
    }
    
    // Handle frontend-only pages (dynamic, from config)
    if (shouldPreserveOnLanguageSwitch(mainSlug)) {
      const fullPath = `/${mainSlug}`;
      return targetLang === defaultLang ? fullPath : `/${targetLang}${fullPath}`;
    }
    
    // For regular pages (non-CPT), we can't translate without pageId, so fallback to home
    return targetLang === defaultLang ? '/' : `/${targetLang}`;
  }

  if (languages.length === 0) return null;

  return (
    <div className="lang-switcher-simple">
      <Icons.Globe size={21} strokeWidth={0.8} className="lang-icon" />
      {languages.map((lang) => {
        const href = buildLanguageUrl(lang.code);
        const isActive = currentLocale === lang.code;
        return (
          <a
            key={lang.code} 
            href={href}
            onClick={(e) => { 
              e.preventDefault(); 
              window.location.href = href; // Force full page reload to update translations
            }}
            className={`lang-link ${isActive ? 'active' : ''}`} 
            aria-label={`Switch to ${lang.name}`}
          >
            {lang.code.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}