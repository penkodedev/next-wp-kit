import { WpPageIdSetter } from '@/utils/wordpress/WpPageIdContext';
import HeroConfig from '@/components/sections/HeroConfig';
import SliderRecursos from '@/components/sections/SliderRecursos';
import { processContent } from '@/utils/wordpress/processContent';
import type { Page } from '@/types/wordpressTypes';

type ContentHomeProps = {
  page: Page;
};

/**
 * Template para la home page
 * Usado tanto por app/page.tsx como por app/[...slug]/page.tsx (rutas con locale)
 */
export default function ContentHome({ page }: ContentHomeProps) {
  return (
    <>
      <WpPageIdSetter pageId={page.id} />
      <HeroConfig />
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
