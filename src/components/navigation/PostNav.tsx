// src/components/navigation/PostNav.tsx
// Component for post navigation (previous/next) with locale support

import Link from 'next/link';
import { getPostNavigation } from '@/api/wordpressApi';
import { Icons } from '@/components/ui/Icons';
import { getTranslatedCptSlug } from '@/utils/config/cptConfig';
import localesConfig from '@/i18n/locales.generated.json';

type PostNavigationProps = {
  postId: number;
  postType: string;
  basePath: string; // Base path of the CPT (e.g., "/cpt_slug") - deprecated, now calculated dynamically
  locale?: string; // Current locale for URL generation
};

/**
 * A Server Component that fetches and displays previous/next post navigation.
  * It fetches data on the server, providing better performance and SEO.
 */
export default async function PostNav({ postId, postType, basePath, locale = 'es' }: PostNavigationProps) {
  const navigation = await getPostNavigation(postId, postType, locale);

  if (!navigation || (!navigation.previous && !navigation.next)) {
    return null; // Don't render anything if there's no previous or next post
  }


/**********************************************
      START BUILDING THE PAGE CONTENT HTML
**********************************************/
  // Get translated CPT slug for the current locale
  const translatedCptSlug = getTranslatedCptSlug(postType, locale);
  
  // Generate locale-aware URLs
  const generateUrl = (slug: string) => {
    const localePrefix = locale === localesConfig.defaultLocale ? '' : `/${locale}`;
    return `${localePrefix}/${translatedCptSlug}/${slug}`;
  };

  return (
    <nav className="post-navigation">

      {navigation.previous && (
        <div className="nav-previous">
        <Link href={generateUrl(navigation.previous.slug)} rel="prev" className="prev-link">
          <Icons.ArrowLeft size={26} strokeWidth={1} className="arrow-left" />
          {navigation.previous.title}
        </Link>
      </div>
      )}

      {navigation.next && (
        <div className="nav-next">
        <Link href={generateUrl(navigation.next.slug)} rel="next" className="next-link">
            {navigation.next.title}
            <Icons.ArrowRight size={26} strokeWidth={1} className="arrow-right" />
        </Link>
      </div>
      )}

    </nav>
  );
}
