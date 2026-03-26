// src/components/layout/header/LangSwitcher.tsx
// 
"use client";

import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { useState, useEffect } from 'react';
import { getWpmlTranslation, getWpmlLanguages, type WpmlLanguages } from '@/api/wordpressApi';
import localesConfig from '@/i18n/locales.generated.json';

interface LangInfo {
  code: string;
  native_name: string;
  name: string;
  is_default?: boolean;
  url?: string;
}
import { useWpPageId } from '@/utils/wordpress/WpPageIdContext';
import { CPT_SLUG_MAP, getTranslatedCptSlug } from '@/utils/config/cptConfig';
import { shouldPreserveOnLanguageSwitch } from '@/utils/config/frontendPagesConfig';

interface LangSwitcherProps {
  currentLocale: string;
}

export default function LangSwitcher({ currentLocale }: LangSwitcherProps) {
  const pathname = usePathname();
  const { pageId } = useWpPageId();
  const [languages, setLanguages] = useState<LangInfo[]>([]);
  const [translatedUrls, setTranslatedUrls] = useState<Record<string, string | null>>({});

  const defaultLang = languages.find(l => l.is_default)?.code || localesConfig.defaultLocale;

  // Fetch available languages from WordPress
  useEffect(() => {
    getWpmlLanguages().then(data => {
      if (data?.languages) {
        setLanguages(data.languages.map(lang => ({
          code: lang.code,
          native_name: lang.native_name,
          name: lang.name,
          is_default: lang.is_default,
          url: lang.url
        })));
      } else {
        setLanguages(localesConfig.supportedLocales.map(code => ({
          code,
          native_name: code,
          name: code
        })));
      }
    });
  }, []);

  // Fetch translations for current page (clears stale URLs on every dep change)
  useEffect(() => {
    setTranslatedUrls({});

    if (!pageId || languages.length === 0) return;

    let cancelled = false;

    const otherLangs = languages.filter(l => l.code !== currentLocale);

    Promise.all(
      otherLangs.map(lang =>
        getWpmlTranslation(pageId, lang.code).then(t => [lang.code, t?.url || null] as const)
      )
    ).then(entries => {
      if (cancelled) return;
      const urls: Record<string, string | null> = { [currentLocale]: pathname };
      for (const [code, url] of entries) urls[code] = url;
      setTranslatedUrls(urls);
    });

    return () => { cancelled = true; };
  }, [pageId, currentLocale, languages, pathname]);

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
    // If we have a valid translated URL from WPML API, use it
    // If translatedUrls[targetLang] is null, it means the API call is in progress or failed
    // In that case, try to construct the URL manually instead of falling back to home
    if (pageId && translatedUrls[targetLang] !== undefined && translatedUrls[targetLang] !== null) {
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
    
    // For regular pages (non-CPT), try to preserve the current path with language prefix
    // Instead of always going to home, try to switch just the language prefix
    const currentPath = '/' + routeSegments.join('/');
    return withLocalePrefix(currentPath, targetLang);
  }

  if (languages.length === 0) return null;

  // Get current language info
  const currentLang = languages.find(lang => lang.code === currentLocale);
  const otherLanguages = languages.filter(lang => lang.code !== currentLocale);

  return (
    <div className="lang-switcher-simple">
      <Icons.Globe size={20} strokeWidth={1.5} className="lang-icon" />
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
