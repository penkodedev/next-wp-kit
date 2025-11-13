// src/i18n/i18n.ts
// Internationalization configuration with dynamic translation support for WP headless

import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales in the system
export const SUPPORTED_LOCALES = ['es', 'en'] as const; // This can be dynamic in the future if needed
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Default configuration for next-intl
export default getRequestConfig(async ({ locale: localeFromPath }) => {
  // Use provided locale or default to Spanish
  const locale = localeFromPath || 'es';

  // Validate that the incoming `locale` parameter is valid
  if (!SUPPORTED_LOCALES.includes(locale as any)) notFound();

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default
  };
});