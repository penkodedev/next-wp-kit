// src/app/blog/page.tsx
import { getAllContent } from '@/api/wordpressApi';
import type { Post } from '@/types/wordpressTypes';
import { logger } from '@/utils/logger';
import ContentArchive from '@/components/layout/content/ContentArchive';

export default async function BlogIndexPage() {
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
      locale="es"
    />
  );
}