"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import localesConfig from '@/i18n/locales.generated.json';
import { getAppearanceSettings } from '@/api/wordpressApi';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const HIDE_LAST_ITEM = false;

export default function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const segments = pathname.split('/').filter(Boolean);

  const isLocalized = segments.length > 0 && localesConfig.supportedLocales.includes(segments[0]);
  const locale = isLocalized ? segments[0] : null;
  const actualSegments = isLocalized ? segments.slice(1) : segments;

  useEffect(() => {
    let cancelled = false;
    getAppearanceSettings().then((settings) => {
      if (!cancelled) setEnabled(settings?.breadcrumbs !== false);
    }).catch(() => {
      if (!cancelled) setEnabled(true);
    });
    return () => { cancelled = true; };
  }, []);

  if (enabled === false || actualSegments.length === 0) {
    return null;
  }

  let breadcrumbItems: BreadcrumbItem[] = [
    { label: t('home'), href: locale ? `/${locale}` : '/' },
    ...actualSegments.map((segment, index) => {
      const href = locale
        ? `/${locale}/${actualSegments.slice(0, index + 1).join('/')}`
        : `/${actualSegments.slice(0, index + 1).join('/')}`;

      // For breadcrumbs, show the segment as-is but formatted
      // The actual translation happens at the page level, not breadcrumb level
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      return { label, href };
    }),
  ];

  // Si la opción está activada y hay más de un elemento (Inicio), elimina el último.
  if (HIDE_LAST_ITEM && breadcrumbItems.length > 1) {
    breadcrumbItems.pop();
  }

  // Obtener la URL base desde las variables de entorno
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''; // Fallback a vacío si no está definida

  // Generar los datos estructurados para SEO (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  };

  // Renderizamos en HTML de los breadcrumbs y el script JSON-LD
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ul className="breadcrumb">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <li key={item.href}>
                {!isLast ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span aria-current="page">{item.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Script con los datos estructurados para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}