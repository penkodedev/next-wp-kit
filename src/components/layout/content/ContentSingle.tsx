import { Icons } from '@/components/ui/Icons';
import Link from 'next/link';
import AnimatedArticle from '@/components/animations/AnimatedArticle';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import PostNav from '@/components/navigation/PostNav';
import Sidebar from '@/components/layout/Sidebar';
import { WpPageId } from '@/utils/WpPageId';
import { processContent } from '@/utils/processContent';
import type { WpContent } from '@/types/wordpressTypes';

type ContentSingleProps = {
  post: WpContent;
  cpt: string;
  backToArchiveUrl: string;
  archiveName: string;
  locale: string;
};

/**
 * Template para mostrar un post individual de cualquier CPT
 * Usado por el catch-all y por carpetas específicas de CPT
 */
export default function ContentSingle({ 
  post, 
  cpt, 
  backToArchiveUrl, 
  archiveName,
  locale 
}: ContentSingleProps) {
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

            <div className="icons-wrap">
              <Icons.Share2
                size={21}
                strokeWidth={1.5}
                className="icons-page-title icon-share"
              />
              <Icons.Heart
                size={21}
                strokeWidth={1.5}
                className="icons-page-title icon-heart"
              />
            </div>
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
          postType={cpt}
          basePath={backToArchiveUrl}
          locale={locale}
        />
      </main>
      <Sidebar />
    </div>
  );
}
