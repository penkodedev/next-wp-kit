// src/components/layout/header/LanguageSwitcher.tsx
"use client";

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAvailableLanguages, getTranslatedSlug } from '@/api/wordpressApi';
import { Icons } from '@/components/ui/Icons';

type Language = {
  code: string;
  name: string;
  native_name: string;
  url: string;
  active: boolean;
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract current locale from pathname
  // If no locale prefix, assume Spanish (default)
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentLocale = (pathSegments.length > 0 && ['es', 'en'].includes(pathSegments[0])) ? pathSegments[0] : 'es';

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const langs = await getAvailableLanguages();
        setLanguages(langs);
      } catch (error) {
        console.error('Error fetching languages:', error);
        // Fallback to hardcoded languages if API fails - but only ES/EN as requested
        setLanguages([
          { code: 'es', name: 'Español', native_name: 'Español', url: '', active: true },
          { code: 'en', name: 'English', native_name: 'English', url: '', active: false }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  const switchLocale = async (newLocale: string) => {
    // Get the path without current locale
    const pathWithoutLocale = currentLocale === 'es' ? pathname : pathname.replace(`/${currentLocale}`, '') || '/';

    // Extract the current slug to translate
    const currentSlug = pathWithoutLocale.split('/').filter(Boolean).pop();

    // Handle switching FROM English TO Spanish (reverse translation)
    if (currentSlug && newLocale === 'es' && currentLocale !== 'es') {
      try {
        // Get the original slug from WPML (reverse lookup)
        const translation = await getTranslatedSlug(currentSlug, 'es');
        if (translation && translation.has_translation) {
          // Replace the slug with the original version
          const originalPath = pathWithoutLocale.replace(currentSlug, translation.translated_slug);
          const finalPath = originalPath; // No locale prefix for Spanish
          console.log('Switching back to Spanish:', finalPath);
          router.push(finalPath);
          return;
        }
      } catch (error) {
        console.error('Error fetching original slug:', error);
        // Fall back to original behavior
      }
    }

    // Handle switching FROM Spanish TO other languages
    if (currentSlug && newLocale !== 'es' && currentLocale === 'es') {
      try {
        // Get the translated slug from WPML
        const translation = await getTranslatedSlug(currentSlug, newLocale);
        if (translation && translation.has_translation) {
          // Replace the slug with the translated version
          const translatedPath = pathWithoutLocale.replace(currentSlug, translation.translated_slug);
          const finalPath = `/${newLocale}${translatedPath}`;
          console.log('Switching to translated path:', finalPath);
          router.push(finalPath);
          return;
        }
      } catch (error) {
        console.error('Error fetching translated slug:', error);
        // Fall back to original behavior
      }
    }

    // Default behavior: For Spanish (default), navigate without locale prefix
    // For other languages, add the locale prefix
    const newPath = newLocale === 'es' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;
    console.log('Switching to:', newPath);
    router.push(newPath);
  };

  if (loading) {
    return (
      <div className="lang-switcher-simple">
        <span className="lang-link">...</span>
      </div>
    );
  }

  const currentLanguage = languages.find(l => l.code === currentLocale) || languages[0];



/**********************************************
      START BUILDING SWITCHER CONTENT
**********************************************/
  return (
    <div className="lang-switcher-simple">
      <Icons.Globe size={23} strokeWidth={1} className="lang-icon" />
      {[...languages].reverse().map((language) => (
        <a
          key={language.code}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            switchLocale(language.code);
          }}
          className={`lang-link ${language.code === currentLocale ? 'active' : ''}`}
          aria-label={`Cambiar a ${language.native_name}`}
        >
          {language.code.toUpperCase()}
        </a>
      ))}
    </div>
  );
}