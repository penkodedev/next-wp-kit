// src/components/sections/sliders/SliderRenderer.tsx

/**
 * Server Component that fetches slider data from the API
 * and renders the appropriate slide cards based on slider type.
 */

import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/bundle';

import { getSliderById } from '@/api/wordpressApi';
import type { SliderData, SliderSlide, WpTestimonioPost } from '@/api/wordpressApi';
import dynamic from 'next/dynamic';
import PostCard from '@/components/ui/PostCard';
import { CardTestimonial, CardMedia, CardCustom } from './SliderCards';
import { buildSwiperOptions } from './buildSwiperOptions';

const SliderBase = dynamic(() => import('./SliderBase'), {
  ssr: false,
});

interface SliderRendererProps {
  sliderId: number;
  lang?: string;
}

/**
 * Maps a testimonios CPT post into the SliderSlide shape used by CardTestimonial.
 * Native fields → testimonial fields:
 *   post_title       → name
 *   post_content     → text (HTML)
 *   featured image   → image_url
 *   meta._testimonio → role / company / rating / link
 */
function mapTestimonioPostToSlide(post: WpTestimonioPost): SliderSlide {
  const featured = post._embedded?.['wp:featuredmedia']?.[0];
  return {
    name: post.title?.rendered ?? '',
    text: post.content?.rendered ?? '',
    image_url: featured?.source_url ?? '',
    role: post.testimonio?.role,
    company: post.testimonio?.company,
    rating: post.testimonio?.rating,
    link: post.testimonio?.link,
  };
}

function renderSlides(data: SliderData): React.ReactNode[] {
  const showExcerpt = data.config.showExcerpt !== 0;
  const excerptLength = showExcerpt ? (data.config.excerptLength ?? 150) : 0;
  const imageLink = data.config.imageLink !== 0;

  switch (data.type) {
    case 'cpt': {
      const posts = data.posts ?? [];

      // Auto-detect: testimonios CPT renders with CardTestimonial.
      // Any other CPT renders with the generic PostCard.
      if (data.source?.postType === 'testimonios') {
        return posts.map((post) => (
          <CardTestimonial key={post.id} slide={mapTestimonioPostToSlide(post)} />
        ));
      }

      return posts.map((post) => (
        <PostCard
          key={post.id}
          item={post}
          basePath={`/${data.source?.postType ?? 'posts'}`}
          excerptLength={excerptLength}
          imageLink={imageLink}
        />
      ));
    }

    case 'media':
      return (data.slides ?? []).map((slide: SliderSlide, i: number) => (
        <CardMedia key={i} slide={slide} />
      ));

    case 'custom':
      return (data.slides ?? []).map((slide: SliderSlide, i: number) => (
        <CardCustom key={i} slide={slide} />
      ));

    default:
      return [];
  }
}

export default async function SliderRenderer({ sliderId, lang }: SliderRendererProps) {
  const data = await getSliderById(sliderId, lang);

  if (!data) return null;

  const slides = renderSlides(data);
  if (slides.length === 0) return null;

  const swiperOptions = buildSwiperOptions(data.config);

  const fullWidth = data.config.fullWidth === 1;
  const displayMode = data.config.displayMode || 'contain';
  const grayscale = data.config.grayscale === 1;
  const opacity = (data.config.opacity ?? 100) / 100;

  const cssVars = {
    '--slide-grayscale': grayscale ? 1 : 0,
    '--slide-opacity': opacity,
  } as React.CSSProperties;

  const sourceClass = data.source?.postType ? ` slider-${data.source.postType}` : '';

  return (
    <section
      className={`slider-section slider-${data.type}${sourceClass} media-${displayMode}${fullWidth ? ' full-width' : ''}`}
      style={cssVars}
    >
      <SliderBase swiperOptions={swiperOptions} className={`slider-${data.type}${sourceClass}`}>
        {slides}
      </SliderBase>
    </section>
  );
}
