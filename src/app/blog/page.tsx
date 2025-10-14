// src/app/blog/page.tsx
import { getAllPosts } from '@/api/wordpressApi';
import PostCard from '@/components/ui/PostCard';
import type { Post } from '@/types/wordpressTypes';

export default async function BlogIndexPage() {
  let posts: Post[] = [];

  try {
    posts = await getAllPosts();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return (
      <div className="container">
        <h1>Blog</h1>
        <p>Hubo un error al cargar el blog. Por favor, inténtalo de nuevo más tarde.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="container">
        <h1>Blog</h1>
        <p>No se encontraron posts.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Blog</h1>
      <div className="posts-grid">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} /> // Component to display individual post details
        ))}
      </div>
    </div>
  );
}