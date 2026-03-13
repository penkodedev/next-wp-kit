import AnimatedArticle from '@/components/animations/framer/AnimatedArticle';
import ScrollReveal from '@/components/animations/gsap/ScrollReveal';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { ContactForm7Content } from '@/components/forms';
import { WpPageIdSetter } from '@/utils/wordpress/WpPageIdContext';
import type { Page } from '@/types/wordpressTypes';
import { processContent, hasSliderMarkers, splitContentSegments } from '@/utils/wordpress/processContent';
import SliderRenderer from '@/components/sections/sliders/SliderRenderer';
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
  const hasSliders = hasSliderMarkers(processed);

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
              {hasSliders ? (
                <ContentWithSliders html={processed} lang={lang} hasForm={hasForm} />
              ) : (
                <ContactForm7Content
                  content={processed}
                  hasForm={hasForm}
                />
              )}
              {children}
          </article>
        </ScrollReveal>
      </div>
    </>
  );
}

function ContentWithSliders({ html, lang, hasForm }: { html: string; lang?: string; hasForm: boolean }) {
  const segments = splitContentSegments(html);

  return (
    <>
      {segments.map((seg, i) =>
        seg.type === 'html' ? (
          <ContactForm7Content
            key={i}
            content={seg.content}
            hasForm={hasForm && seg.content.includes('wpcf7-form')}
          />
        ) : (
          <SliderRenderer key={i} sliderId={seg.sliderId} lang={lang} />
        )
      )}
    </>
  );
}
