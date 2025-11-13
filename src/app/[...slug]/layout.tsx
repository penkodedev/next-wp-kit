// src/app/[...slug]/layout.tsx
// Layout for dynamic routes that handles locale detection

import { ReactNode } from 'react';
import LocaleSync from '@/components/ui/LocaleSync';

interface SlugLayoutProps {
  children: ReactNode;
  params: {
    slug: string[];
  };
}

export default function SlugLayout({ children, params }: SlugLayoutProps) {
  // Detect locale from URL path
  const locale = params.slug?.[0] === 'en' ? 'en' : 'es';

  return (
    <>
      <LocaleSync locale={locale} />
      {children}
    </>
  );
}