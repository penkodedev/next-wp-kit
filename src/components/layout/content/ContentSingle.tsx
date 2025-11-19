import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import AnimatedArticle from '@/components/animations/AnimatedArticle';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import PostNav from '@/components/navigation/PostNav';
import Sidebar from '@/components/layout/sidebar/Sidebar';
import ShareLikeButtons from '@/components/ui/ShareLikeButtons';
import { WpPageId } from '@/utils/WpPageId';
import { processContent } from '@/utils/processContent';
import { getTranslatedCptSlug } from '@/utils/cptConfig';
import type { WpContent } from '@/types/wordpressTypes';

type ContentSingleProps = {
  post: WpContent;
  postType: string;   // 'posts', 'noticias', 'recursos', etc.
  locale: string;     // 'es', 'en'
};

/**
 * Template para mostrar un post individual de cualquier post type
 * Calcula internamente backToArchiveUrl y archiveName según postType y locale
 */
export default function ContentSingle({ 
  post, 
  postType,
  locale 
}: ContentSingleProps) {
  // Calcular backToArchiveUrl y archiveName internamente
  const translatedSlug = getTranslatedCptSlug(postType, locale);
  const safeSlug = translatedSlug || postType || 'posts'; // Triple fallback
  const archiveName = safeSlug.charAt(0).toUpperCase() + safeSlug.slice(1);
  const backToArchiveUrl = locale === 'es' ? `/${safeSlug}` : `/${locale}/${safeSlug}`;

  return (
    <div className="page-sidebar">
      <WpPageId id={post.id} />
      <main>
        <article className="entry-content">
          <Link href={backToArchiveUrl} className="back-to-archive-link">
            <Icons.ArrowLeft size={26} strokeWidth={1} className="arrow-left" />
            {archiveName}
          </Link>

          <section className="page-title">
            <h1>{post.title.rendered}</h1>

            <ShareLikeButtons />
          </section>
          
          <Breadcrumbs />
          
          <AnimatedArticle className="custom-article-class" amount={0.5}>
            <div
              dangerouslySetInnerHTML={{
                __html: processContent(post.content.rendered),
              }}
            />
          </AnimatedArticle>
        </article>
        
        <PostNav
          postId={post.id}
          postType={postType}
          basePath={backToArchiveUrl}
          locale={locale}
        />
      </main>
      <Sidebar />
    </div>
  );
}
