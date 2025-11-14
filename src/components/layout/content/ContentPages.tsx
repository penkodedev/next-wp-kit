import AnimatedArticle from '@/components/animations/AnimatedArticle';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { ContactForm7Content } from '@/components/forms';
import { WpPageIdSetter } from '@/utils/WpPageIdContext';
import type { Page } from '@/types/wordpressTypes';

type ContentPagesProps = {
  page: Page;
};

/**
 * Template para mostrar páginas estáticas de WordPress
 * Usado por el catch-all
 */
export default function ContentPages({ page }: ContentPagesProps) {
  return (
    <>
      <WpPageIdSetter pageId={page.id} />
      <div className="page-one-col">
        <main>
          <section className="page-title">
            <h1>{page.title.rendered}</h1>
          </section>
          <article className="page-content">
            <AnimatedArticle>
              <Breadcrumbs />
              <ContactForm7Content
                content={page.content.rendered}
                hasForm={page.content.rendered.includes('wpcf7-form')}
              />
            </AnimatedArticle>
          </article>
        </main>
      </div>
    </>
  );
}
