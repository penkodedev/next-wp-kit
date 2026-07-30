// src/app/blog/page.tsx
import { getAllContent } from '@/api/wordpressApi';
import type { Post } from '@/types/wordpressTypes';
import { logger } from '@/utils/wordpress/logger';
import ContentArchive from '@/components/layout/content/ContentArchive';
import { headers } from 'next/headers';
import localesConfig from '@/i18n/locales.generated.json';
import { getPostsPerPage } from '@/utils/config/pagination';

export const revalidate = 60;

export default async function BlogIndexPage() {
  // Get current locale from middleware header
  const headersList = headers();
  const locale = (headersList.get('x-locale') || localesConfig.defaultLocale) as string;

  let posts = null;
  const postsPerPage = getPostsPerPage('posts');

  try {
    posts = await getAllContent<Post>('posts', `?per_page=${postsPerPage}&_embed`);
  } catch (error) {
  logger.error('Error fetching posts:', error as Error);
  }

  return (
    <ContentArchive 
      posts={posts}
      postType="posts"
      locale={locale}
      title="Blog"
    />
  );
}