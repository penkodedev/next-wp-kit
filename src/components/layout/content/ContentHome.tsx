import { WpPageIdSetter } from '@/utils/wordpress/WpPageIdContext';
import HeroWrapper from '@/components/sections/HeroWrapper';
import { processContent } from '@/utils/wordpress/processContent';
import type { Page } from '@/types/wordpressTypes';
import ScrollReveal from '@/components/animations/gsap/ScrollReveal';
import AnimatedArticle from '@/components/animations/framer/AnimatedArticle';
import DynamicContent from './DynamicContent';
import YoastJsonLd from '@/components/seo/YoastJsonLd';

type ContentHomeProps = {
  page: Page;
  lang?: string;
};

/**
 * Home Page Template
 * Used by both app/page.tsx and app/[...slug]/page.tsx (routes with locale)
 */
export default function ContentHome({ page, lang }: ContentHomeProps) {
  const processed = processContent(page.content.rendered);
  const hasForm = page.content.rendered.includes('wpcf7-form');

  return (
    <>
      <YoastJsonLd content={page} />
      <WpPageIdSetter pageId={page.id} />
      <HeroWrapper position="home" lang={lang} />
      <div className="page-one-col">
      <span id='index-home' />
        <AnimatedArticle>
          <ScrollReveal>
            <DynamicContent html={processed} lang={lang} hasForm={hasForm} />
          </ScrollReveal>
        </AnimatedArticle>
      </div>
    </>
  );
}
