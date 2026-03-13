import { WpPageIdSetter } from '@/utils/wordpress/WpPageIdContext';
import HeroWrapper from '@/components/sections/HeroWrapper';
import { processContent, hasSliderMarkers, splitContentSegments } from '@/utils/wordpress/processContent';
import type { Page } from '@/types/wordpressTypes';
import ScrollReveal from '@/components/animations/gsap/ScrollReveal';
import AnimatedArticle from '@/components/animations/framer/AnimatedArticle';
import SliderRenderer from '@/components/sections/sliders/SliderRenderer';

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
  const hasSliders = hasSliderMarkers(processed);

  return (
    <>
      <WpPageIdSetter pageId={page.id} />
      <HeroWrapper position="home" lang={lang} />
      <div className="page-one-col">
        <AnimatedArticle>
          <ScrollReveal>
            {hasSliders ? (
              <ContentWithSliders html={processed} lang={lang} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: processed }} />
            )}
          </ScrollReveal>
        </AnimatedArticle>
      </div>
    </>
  );
}

function ContentWithSliders({ html, lang }: { html: string; lang?: string }) {
  const segments = splitContentSegments(html);

  return (
    <>
      {segments.map((seg, i) =>
        seg.type === 'html' ? (
          <div key={i} dangerouslySetInnerHTML={{ __html: seg.content }} />
        ) : (
          <SliderRenderer key={i} sliderId={seg.sliderId} lang={lang} />
        )
      )}
    </>
  );
}
