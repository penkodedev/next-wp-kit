// src/components/ui/LocaleSync.tsx
// Client component that syncs the HTML lang attribute with the current locale

'use client';

import { useEffect } from 'react';

interface LocaleSyncProps {
  locale: string;
}

export default function LocaleSync({ locale }: LocaleSyncProps) {
  useEffect(() => {
    // Update the HTML lang attribute with proper format
    const langAttribute = locale === 'es' ? 'es-ES' : 'en-US';
    document.documentElement.lang = langAttribute;

    console.log('LocaleSync: Set lang to', langAttribute, 'for locale', locale);

    // Optional: Store locale in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', locale);
    }
  }, [locale]);

  // This component doesn't render anything
  return null;
}