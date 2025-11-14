// src/i18n/i18n.ts
// Internationalization configuration with dynamic translation support for WP headless

import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { getWpmlLanguages } from '@/api/wordpressApi';

// Type for supported locales
export type SupportedLocale = string;

/**
 * Get supported locales dynamically from WordPress WPML
 * Falls back to hardcoded values if WordPress is unavailable
 */
export async function getSupportedLocales(): Promise<string[]> {
  const wpmlData = await getWpmlLanguages();
  return wpmlData.languages.map(lang => lang.code);
}

/**
 * Get default locale from WordPress WPML
 */
export async function getDefaultLocale(): Promise<string> {
  const wpmlData = await getWpmlLanguages();
  return wpmlData.default;
}

// Default configuration for next-intl
export default getRequestConfig(async ({ locale: localeFromPath }) => {
  const defaultLocale = await getDefaultLocale();
  const locale = localeFromPath || defaultLocale;

  // Validate that the incoming locale is valid
  const supportedLocales = await getSupportedLocales();
  if (!supportedLocales.includes(locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default
  };
});