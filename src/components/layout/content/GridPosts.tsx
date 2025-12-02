// src/components/layout/GridPosts.tsx
// Reusable component for displaying posts in a grid layout

import type { WpContent } from '@/types/wordpressTypes';
import PostCard from '@/components/ui/PostCard';

type GridPostsProps = {
  posts: WpContent[];
  basePath: string;
  excerptLength?: number;
  cols?: number;
};

export default function GridPosts({
  posts,
  basePath,
  excerptLength,
  cols
}: GridPostsProps) {
  const finalExcerptLength = excerptLength ?? 150; // Excerpt sizee
  const finalCols = cols ?? 3; // Number of columns

  
// -----------------------------------------------------
//           START BUILDING GRID POSTS HTML
// -----------------------------------------------------
  return (
    <div className={`post-grid cols-${finalCols}`}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          item={post}
          basePath={basePath}
          excerptLength={finalExcerptLength}
        />
      ))}
    </div>
  );
}