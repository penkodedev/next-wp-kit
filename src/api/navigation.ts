import { fetchAPI } from './client';
import type { PostNavigation } from '@/types/wordpressTypes';
import localesConfig from '@/i18n/locales.generated.json';

/**
 * Fetches the previous and next post for navigation.
 * @param postId The ID of the current post.
 * @param postType The post type (e.g., 'posts').
 */
export async function getPostNavigation(postId: number, postType: string, lang: string = localesConfig.defaultLocale): Promise<PostNavigation | null> {
  return await fetchAPI<PostNavigation>(
    `/custom/v1/post-navigation?post_id=${postId}&post_type=${postType}&lang=${lang}`,
    { next: { revalidate: process.env.NODE_ENV === 'production' ? 60 : 0 } }
  );
}
