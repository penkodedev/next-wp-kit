import AnimatedArticle from '@/components/animations/framer/AnimatedArticle';
import ScrollReveal from '@/components/animations/gsap/ScrollReveal';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { ContactForm7Content } from '@/components/forms';
import { WpPageIdSetter } from '@/utils/wordpress/WpPageIdContext';
import type { Page } from '@/types/wordpressTypes';
import { processContent } from '@/utils/wordpress/processContent';
import type { ReactNode } from 'react';

type ContentPagesProps = {
  page: Page;
  children?: ReactNode; // Optional children to render inside article
};

/**
 * Template para mostrar páginas estáticas de WordPress
 * Usado por el catch-all
 */
export default function ContentPages({ page, children }: ContentPagesProps) {
  return (
    <>
      <WpPageIdSetter pageId={page.id} />
      <div className="page-one-col">
          <section className="page-title">
            <h1>{page.title.rendered}</h1>
          </section>
        
        <Breadcrumbs />
        <ScrollReveal>

            <article className="page-content"> 
              <ContactForm7Content
                content={page.content.rendered}
                hasForm={page.content.rendered.includes('wpcf7-form')}
              />
              {children}
          </article>
          
          </ScrollReveal>
      </div>
    </>
  );
}
