import GridPosts from '@/components/layout/content/GridPosts';
import { getTranslatedCptSlug } from '@/utils/cptConfig';
import type { WpContent } from '@/types/wordpressTypes';

type ContentArchiveProps = {
  posts: WpContent[] | null;
  postType: string;   // 'posts', 'noticias', 'recursos', etc.
  locale: string;     // 'es', 'en'
};

/**
 * Template para mostrar el archivo (listado) de cualquier post type
 * Calcula internamente displayTitle y basePath según postType y locale
 */
export default function ContentArchive({ 
  posts, 
  postType,
  locale
}: ContentArchiveProps) {
  // Calcular displayTitle y basePath internamente
  const translatedSlug = getTranslatedCptSlug(postType, locale);
  const displayTitle = translatedSlug.charAt(0).toUpperCase() + translatedSlug.slice(1);
  const basePath = locale === 'es' ? `/${translatedSlug}` : `/${locale}/${translatedSlug}`;

  return (
    <div className="page-fullwidth">
      <section className="page-title">
        <h1>{displayTitle}</h1>
      </section>

      {posts && posts.length > 0 ? (
        <GridPosts posts={posts} basePath={basePath} />
      ) : (
        <article>
          <p>No se encontró contenido en esta sección.</p>
        </article>
      )}
    </div>
  );
}
