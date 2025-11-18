// src/components/layout/Sidebar.tsx

import LatestPostsList from '@/components/ui/LatestPostsList';
import { headers } from 'next/headers';

export default async function Sidebar() {
  // Get current locale from middleware header
  const headersList = headers();
  const locale = (headersList.get('x-locale') || 'es') as string;

  return (
    <aside>
      <div className="sidebox">
        <LatestPostsList postType="recursos" perPage={5} locale={locale} />
      </div>

      {/* You can add more .sidebox divs here for other widgets like search, categories, etc. */}
    </aside>
  );
}
