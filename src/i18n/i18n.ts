// src/i18n/i18n.ts
// Internationalization configuration with dynamic translation support for WP headless

import { getRequestConfig } from 'next-intl/server';
import { getWpmlLanguages } from '@/api/wordpressApi';

import localesConfig from '@/i18n/locales.generated.json';

// Type for supported locales
export type SupportedLocale = string;

/**
 * Get supported locales dynamically from WordPress WPML
 * Falls back to locales.generated.json if WPML unavailable
 */
export async function getSupportedLocales(): Promise<string[]> {
  try {
    const wpmlData = await getWpmlLanguages();
    if (wpmlData?.languages) {
      return wpmlData.languages.map(lang => lang.code);
    }
  } catch (error) {
    // Fallback to generated config
  }
  return localesConfig.supportedLocales;
}

/**
 * Get default locale from WordPress WPML
 * Falls back to locales.generated.json if WPML unavailable
 */
export async function getDefaultLocale(): Promise<string> {
  try {
    const wpmlData = await getWpmlLanguages();
    if (wpmlData?.default) {
      return wpmlData.default;
    }
  } catch (error) {
    // Fallback to generated config
  }
  return localesConfig.defaultLocale;
}

// Default configuration for next-intl
export default getRequestConfig(async ({ locale: localeFromPath }) => {
  const defaultLocale = await getDefaultLocale();
  const locale = localeFromPath || defaultLocale;

  // Validate that the incoming locale is valid
  const supportedLocales = await getSupportedLocales();
  
  // If locale is not supported, fallback to default instead of notFound()
  const validLocale = supportedLocales.includes(locale) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`./${validLocale}.json`)).default
  };
});