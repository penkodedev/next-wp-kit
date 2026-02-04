// src/components/ui/LatestPostsList.tsx

import Link from 'next/link';
import { getAllContent } from '@/api/wordpressApi';
import { getTranslations } from 'next-intl/server';
import { getTranslatedCptSlug } from '@/utils/config/cptConfig';
import type { WpContent } from '@/types/wordpressTypes';
import { Icons } from '@/components/ui/Icons';
import localesConfig from '@/i18n/locales.generated.json';

interface LatestPostsListProps {
  postType: string;
  perPage?: number;
  locale: string;
  showTitle?: boolean;
}

/**
 * Reusable Server Component for displaying latest posts from any CPT
 * Used in Sidebar, Footer, and anywhere else you need a list of recent posts
 * 
 * @param postType - WordPress CPT slug (e.g., 'recursos', 'noticias', 'hero')
 * @param perPage - Number of posts to display (default: 5)
 * @param locale - Current locale for building correct URLs ('es', 'en')
 * @param showTitle - Whether to show the section title (default: true)
 */
export default async function LatestPostsList({
  postType,
  perPage = 5,
  locale,
  showTitle = true
}: LatestPostsListProps) {
  const t = await getTranslations({ locale, namespace: 'Footer' });
  
  // Get the translated CPT name (e.g., 'recursos' -> 'resorts' in English)
  const translatedPostType = getTranslatedCptSlug(postType, locale);
  
  // Fetch latest posts from WordPress with locale parameter for WPML
  const params = `?per_page=${perPage}&page=1&_embed&orderby=date&order=desc&lang=${locale}`;
  const latestPosts = await getAllContent<WpContent>(postType, params);

  // Build URL based on locale (use translated slug for URL)
  const buildUrl = (slug: string) => {
    return locale === localesConfig.defaultLocale 
      ? `/${translatedPostType}/${slug}` 
      : `/${locale}/${translatedPostType}/${slug}`;
  };

  return (
    <div className="latest-posts-list">
      {showTitle && <h4>{t('latestPosts', { postType: translatedPostType })}</h4>}
      
      {!latestPosts || latestPosts.length === 0 ? (
        <p>{t('noRecentPosts', { postType: translatedPostType })}</p>
      ) : (
        <ul>
          {latestPosts.map((post) => (
            <li key={post.id}>
              <Link href={buildUrl(post.slug)}>
                <Icons.Check size={20} strokeWidth={3} className="list-icon" />
                {post.title.rendered}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
