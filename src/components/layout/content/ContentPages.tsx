import AnimatedArticle from '@/components/animations/framer/AnimatedArticle';
import ScrollReveal from '@/components/animations/gsap/ScrollReveal';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { ContactForm7Content } from '@/components/forms';
import { WpPageIdSetter } from '@/utils/wordpress/WpPageIdContext';
import type { Page } from '@/types/wordpressTypes';
import { processContent } from '@/utils/wordpress/processContent';

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
          <ScrollReveal>
            <article className="page-content">
              <Breadcrumbs />
              <ContactForm7Content
                content={page.content.rendered}
                hasForm={page.content.rendered.includes('wpcf7-form')}
              />
            </article>
          </ScrollReveal>
        </main>
      </div>
    </>
  );
}
