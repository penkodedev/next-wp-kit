import GridPosts from '@/components/layout/content/GridPosts';
import LoadMore from '@/components/navigation/LoadMore';
import { getTranslatedCptSlug } from '@/utils/config/cptConfig';
import type { WpContent } from '@/types/wordpressTypes';
import localesConfig from '@/i18n/locales.generated.json';

type ContentArchiveProps = {
  posts: WpContent[] | null;
  postType: string;   // 'posts', 'noticias', 'recursos', etc.
  locale: string;     // 'es', 'en'
  title?: string;     // Optional: sobrescribe el título automático
};

/**
 * Template para mostrar el archivo (listado) de cualquier post type
 * Calcula internamente displayTitle y basePath según postType y locale
 * Permite sobrescribir título con prop opcional 'title'
 */
export default function ContentArchive({ 
  posts, 
  postType,
  locale,
  title
}: ContentArchiveProps) {
  // Calcular displayTitle y basePath internamente
  const translatedSlug = getTranslatedCptSlug(postType, locale);
  const displayTitle = title || (translatedSlug.charAt(0).toUpperCase() + translatedSlug.slice(1));
  const basePath = locale === localesConfig.defaultLocale ? `/${translatedSlug}` : `/${locale}/${translatedSlug}`;

  return (
    <div className="page-fullwidth">
      <section className="page-title">
        <h1>{displayTitle}</h1>
      </section>

      {posts && posts.length > 0 ? (
        <>
          <GridPosts posts={posts} basePath={basePath} />
          
          {/* Load More button (client component) */}
          <LoadMore
            postType={postType}
            basePath={basePath}
            locale={locale}
            initialPostsCount={posts.length}
          />
        </>
      ) : (
        <article>
          <p>No se encontró contenido en esta sección.</p>
        </article>
      )}
    </div>
  );
}
