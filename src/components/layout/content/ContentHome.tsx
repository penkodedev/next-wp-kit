import { WpPageIdSetter } from '@/utils/wordpress/WpPageIdContext';
import HeroWrapper from '@/components/sections/HeroWrapper';
import Slider from '@/components/sections/Slider';
import { processContent } from '@/utils/wordpress/processContent';
import type { Page } from '@/types/wordpressTypes';
import ScrollReveal from '@/components/animations/gsap/ScrollReveal';
import AnimatedArticle from '@/components/animations/framer/AnimatedArticle';
import ParallaxEffects from '@/components/animations/gsap/ParallaxEffects';

type ContentHomeProps = {
  page: Page;
  lang?: string;
};

/**
 * Home Page Template
 * Used by both app/page.tsx and app/[...slug]/page.tsx (routes with locale)
 */
export default function ContentHome({ page, lang }: ContentHomeProps) {
  return (
    <>
      <WpPageIdSetter pageId={page.id} />
      <HeroWrapper position="home" lang={lang} />
      <div className="page-one-col">
        <AnimatedArticle>
          <ScrollReveal>
            
            <article>
           
              <div dangerouslySetInnerHTML={{ __html: processContent(page.content.rendered) }} />
              
          </article>
          
        </ScrollReveal>
        </AnimatedArticle>
      </div>
      <section className="slider-container">
        <Slider postType="recursos" />
      </section>
    </>
  );
}
