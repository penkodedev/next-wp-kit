// src/app/[...slug]/layout.tsx
// Layout for dynamic routes that handles locale detection

import { ReactNode } from 'react';
import LocaleSync from '@/utils/wordpress/LocaleSync';
import localesConfig from '@/i18n/locales.generated.json';

interface SlugLayoutProps {
  children: ReactNode;
  params: {
    slug: string[];
  };
}

export default function SlugLayout({ children, params }: SlugLayoutProps) {
  // Detect locale from URL path
  const firstSegment = params.slug?.[0];
  const locale = localesConfig.supportedLocales.includes(firstSegment)
    ? firstSegment
    : localesConfig.defaultLocale;

  return (
    <>
      <LocaleSync locale={locale} />
      {children}
    </>
  );
}