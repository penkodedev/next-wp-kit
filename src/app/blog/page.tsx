// src/app/blog/page.tsx
import { getAllContent } from '@/api/wordpressApi';
import type { Post } from '@/types/wordpressTypes';
import { logger } from '@/utils/logger';
import ContentArchive from '@/components/layout/content/ContentArchive';
import { headers } from 'next/headers';
import localesConfig from '@/i18n/locales.generated.json';

export default async function BlogIndexPage() {
  // Get current locale from middleware header
  const headersList = headers();
  const locale = (headersList.get('x-locale') || localesConfig.defaultLocale) as string;

  let posts = null;

  try {
    posts = await getAllContent<Post>('posts', '?per_page=12&_embed');
  } catch (error) {
    logger.error('Error fetching posts:', error);
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