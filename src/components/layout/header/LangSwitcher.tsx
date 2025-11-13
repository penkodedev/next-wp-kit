"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { useState, useEffect } from 'react';
import { getWpmlTranslation } from '@/api/wordpressApi';
import { useWpPageId } from '@/utils/WpPageIdContext';

interface LangSwitcherProps {
  currentLocale: string;
  availableLangs?: string[];
}

const ROUTE_TRANSLATIONS: Record<string, Record<string, string>> = {
  'quienes-somos': { 'es': '/quienes-somos', 'en': '/en/about' },
  'about': { 'es': '/quienes-somos', 'en': '/en/about' },
};

export default function LangSwitcher({ currentLocale, availableLangs = ['es', 'en'] }: LangSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { pageId } = useWpPageId();
  const [translatedUrls, setTranslatedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!pageId) return;
    async function fetchTranslations() {
      const urls: Record<string, string> = {};
      for (const lang of availableLangs) {
        if (lang === currentLocale) {
          urls[lang] = pathname;
        } else {
          const translation = await getWpmlTranslation(pageId, lang);
          urls[lang] = translation?.url || (lang === 'en' ? '/en' : '/');
        }
      }
      setTranslatedUrls(urls);
    }
    fetchTranslations();
  }, [pageId, currentLocale, pathname, availableLangs]);

  function buildLanguageUrl(targetLang: string): string {
    if (translatedUrls[targetLang]) return translatedUrls[targetLang];
    if (pathname === '/' || pathname === '/es' || pathname === '/en') {
      return targetLang === 'es' ? '/' : '/en';
    }
    const segments = pathname.split('/').filter(Boolean);
    const hasLocalePrefix = availableLangs.includes(segments[0]);
    const routeSegments = hasLocalePrefix ? segments.slice(1) : segments;
    const mainSlug = routeSegments[0] || '';
    if (ROUTE_TRANSLATIONS[mainSlug]?.[targetLang]) {
      return ROUTE_TRANSLATIONS[mainSlug][targetLang];
    }
    const baseRoute = '/' + routeSegments.join('/');
    return targetLang === 'es' ? baseRoute : `/en${baseRoute}`;
  }

  return (
    <div className="lang-switcher-simple">
      <Icons.Globe size={21} strokeWidth={0.8} className="lang-icon" />
      {availableLangs.map((lang) => {
        const href = buildLanguageUrl(lang);
        const isActive = currentLocale === lang;
        return (
          <a
            key={lang} 
            href={href}
            onClick={(e) => { e.preventDefault(); router.push(href); }}
            className={`lang-link ${isActive ? 'active' : ''}`} 
            aria-label={`Switch to ${lang.toUpperCase()}`}
          >
            {lang.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}