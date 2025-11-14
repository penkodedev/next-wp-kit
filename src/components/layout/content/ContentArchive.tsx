import GridPosts from '@/components/layout/GridPosts';
import type { WpContent } from '@/types/wordpressTypes';

type ContentArchiveProps = {
  posts: WpContent[] | null;
  displayTitle: string;
  basePath: string;
};

/**
 * Template para mostrar el archivo (listado) de cualquier CPT
 * Usado por el catch-all y por carpetas específicas de CPT
 */
export default function ContentArchive({ 
  posts, 
  displayTitle, 
  basePath 
}: ContentArchiveProps) {
  return (
    <div className="page-fullwidth">
      <section className="page-title">
        <h1>{displayTitle}</h1>
      </section>

      {posts && posts.length > 0 ? (
        <GridPosts posts={posts} basePath={basePath} />
      ) : (
        <article>
          <p>No content found in this section.</p>
        </article>
      )}
    </div>
  );
}
