import { WpPageIdSetter } from '@/utils/wordpress/WpPageIdContext';
import HeroWrapper from '@/components/sections/HeroWrapper';
import SliderRecursos from '@/components/sections/SliderRecursos';
import { processContent } from '@/utils/wordpress/processContent';
import type { Page } from '@/types/wordpressTypes';

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
        <article>
          <div
            dangerouslySetInnerHTML={{
              __html: processContent(page.content.rendered),
            }}
          />
        </article>
      </div>
      <section className="slider-container">
        <SliderRecursos />
      </section>
    </>
  );
}
