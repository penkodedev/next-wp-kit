import { fetchAPI } from './client';

/** Increment like count for a post. */
export async function likePost(postId: number): Promise<{ success: boolean; likes: number } | null> {
  return await fetchAPI<{ success: boolean; likes: number }>(`/custom/v1/posts/${postId}/like`, { method: 'POST' });
}
