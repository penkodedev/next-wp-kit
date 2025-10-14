// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';
 
export default getRequestConfig(async ({ locale: localeFromPath }) => {
  // Si no se proporciona un 'locale' (p. ej., en una página 404),
  // usamos 'es' como valor predeterminado.
  const locale = localeFromPath || 'es';

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default
  };
});