// src/app/tech-news/page.tsx

import { redirect } from 'next/navigation';
import localesConfig from '@/i18n/locales.generated.json';

export default function TechNewsRedirect() {
  // Redirect to default locale
  redirect(`/${localesConfig.defaultLocale}/tech-news`);
}
