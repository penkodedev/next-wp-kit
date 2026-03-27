import ScrollReveal from '@/components/animations/gsap/ScrollReveal';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { WpPageIdSetter } from '@/utils/wordpress/WpPageIdContext';
import type { Page } from '@/types/wordpressTypes';
import { processContent } from '@/utils/wordpress/processContent';
import DynamicContent from './DynamicContent';
import YoastJsonLd from '@/components/seo/YoastJsonLd';
import type { ReactNode } from 'react';

type ContentPagesProps = {
  page: Page;
  lang?: string;
  children?: ReactNode;
};

/**
 * Template para mostrar páginas estáticas de WordPress
 * Usado por el catch-all
 */
export default function ContentPages({ page, lang, children }: ContentPagesProps) {
  const processed = processContent(page.content.rendered);
  const hasForm = page.content.rendered.includes('wpcf7-form');

  return (
    <>
      <YoastJsonLd content={page} />
      <WpPageIdSetter pageId={page.id} />
      <div className="page-one-col">
          <section className="page-title">
            <h1>{page.title.rendered}</h1>
          </section>
        
        <Breadcrumbs />
        <ScrollReveal>
            <article className="page-content">
              <DynamicContent
                html={processed}
                lang={lang}
                hasForm={hasForm}
              />
              {children}
          </article>
        </ScrollReveal>
      </div>
    </>
  );
}
