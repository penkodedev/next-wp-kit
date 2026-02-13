// src/components/layout/Sidebar.tsx

import LatestPostsList from '@/components/sections/LatestPostsList';
import SearchForm from '@/components/forms/SearchForm';
import { headers } from 'next/headers';
import { safeGetSiteInfo } from '@/api/wordpressApi';
import localesConfig from '@/i18n/locales.generated.json';

export default async function Sidebar() {
  // Get current locale from middleware header
  const headersList = headers();
  const siteInfo = await safeGetSiteInfo();
  const defaultLocale = siteInfo?.i18n?.default_locale || localesConfig.defaultLocale;
  const locale = (headersList.get('x-locale') || defaultLocale) as string;

  return (
    <aside>
      <SearchForm />
      <div className="sidebox">
        <LatestPostsList postType="recursos" perPage={5} locale={locale} />
      </div>

      <div className="sidebox">
        <LatestPostsList postType="noticias" perPage={5} locale={locale} />
      </div>

      {/* You can add more .sidebox divs here for other widgets like search, categories, etc. */}
    </aside>
  );
}
