// src/components/layout/header/LangSwitcher.tsx
"use client";

import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';

interface LangSwitcherProps {
  currentLocale: string;
  availableLangs?: string[];
}

/**
 * Mapa de rutas traducidas conocidas.
 * Cuando navegas con el switcher, usa este mapa para ir a la ruta correcta.
 * 
 * Estructura: 
 * - Si es la home, no necesita mapeo (solo `/` vs `/en`)
 * - Si es una página traducida, mapea español -> inglés
 */
const ROUTE_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Página: Quiénes somos -> About
  'quienes-somos': {
    'es': '/quienes-somos',
    'en': '/en/about',
  },
  'about': {
    'es': '/quienes-somos',
    'en': '/en/about',
  },
  // Página: Acerca -> (si tiene traducción)
  'acerca': {
    'es': '/acerca',
    'en': '/en/acerca',
  },
  // Agregar más rutas según sea necesario
};

export default function LangSwitcher({ 
  currentLocale, 
  availableLangs = ['es', 'en'] 
}: LangSwitcherProps) {
  const pathname = usePathname();

  /**
   * Construir la URL del idioma alternativo.
   * Intenta usar el mapa de rutas traducidas.
   * Si no encontr, usa fallback simple.
   */
  function buildLanguageUrl(targetLang: string): string {
    // Caso especial: home
    if (pathname === '/' || pathname === '/es' || pathname === '/en') {
      return targetLang === 'es' ? '/' : '/en';
    }

    // Obtener la ruta sin prefijo de idioma
    const segments = pathname.split('/').filter(Boolean);
    const hasLocalePrefix = availableLangs.includes(segments[0]);
    const routeSegments = hasLocalePrefix ? segments.slice(1) : segments;
    const baseRoute = '/' + routeSegments.join('/');

    // Obtener el slug principal (primer segmento de la ruta)
    const mainSlug = routeSegments[0] || '';

    // Intentar usar el mapa de traducciones
    if (ROUTE_TRANSLATIONS[mainSlug] && ROUTE_TRANSLATIONS[mainSlug][targetLang]) {
      return ROUTE_TRANSLATIONS[mainSlug][targetLang];
    }

    // Fallback: construcción simple
    if (targetLang === 'es') {
      // ES no lleva prefijo
      return baseRoute === '/' ? '/' : baseRoute;
    } else {
      // EN lleva prefijo
      return `/en${baseRoute}`;
    }
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
            className={`lang-link ${isActive ? 'active' : ''}`} 
            aria-label={`Cambiar a ${lang.toUpperCase()}`}
          >
            {lang.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}