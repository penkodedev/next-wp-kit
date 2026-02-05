// src/components/sections/SliderRecursos.tsx
// Generic slider component for any CPT with i18n support

import { getAllContent } from "@/api/wordpressApi";
import PostCard from "@/components/ui/PostCard";
import type { WpContent } from "@/types/wordpressTypes";
import dynamic from "next/dynamic";
import type { SwiperOptions } from "swiper/types";
import { getTranslations } from "next-intl/server";

// Dynamically import SliderBase and disable SSR for it
const SliderBase = dynamic(() => import("@/components/sections/SliderBase"), {
  ssr: false,
});

interface SliderProps {
  postType?: string;      // CPT to fetch (default: recursos)
  perPage?: number;       // Number of items (default: 6)
  customTitle?: string;   // Optional custom title (overrides i18n)
}

/**
 * A generic server component that fetches the latest posts from any CPT
 * and displays them in a carousel with i18n support.
 */
export default async function Slider({
  postType = 'recursos',
  perPage = 6,
  customTitle
}: SliderProps) {

  // Get translated title using i18n
  const t = await getTranslations('SliderTitle');
  const title = customTitle || t(postType);

  // 1. Fetch content from WordPress API
  const params = `?per_page=${perPage}&page=1&_embed&orderby=date&order=desc`;
  const posts = await getAllContent<WpContent>(postType, params);

  // If no posts, don't render anything
  if (!posts || posts.length === 0) {
    return null;
  }

  // 2. Filter only posts that have featured images
  const postsConImagen = posts.filter(
    (post) => post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
  );

  // If no posts with images, don't render
  if (postsConImagen.length === 0) {
    return null;
  }

  // 3. Define slider configuration
  const sliderOptions: SwiperOptions = {
    slidesPerView: 3.7,
    speed: 7000,
    freeMode: true,
    navigation: false,
    pagination: { clickable: true },
    loop: true,
    loopAdditionalSlides: 1,
    allowTouchMove: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
    breakpoints: {
      1920: { slidesPerView: 3 },
      1440: { slidesPerView: 2.2 },
      1024: { slidesPerView: 1.7 },
      900: { slidesPerView: 1.2 },
      768: { slidesPerView: 1.2 },
      640: { slidesPerView: 1 },
      320: { slidesPerView: 1 },
    },
  };

  // 4. Render the slider
  return (
    <section className={`slider-recursos slider-${postType}`}>
      {title && <h1 className={`slider-title slider-title-${postType}`}>{title}</h1>}
      <SliderBase swiperOptions={sliderOptions}>
        {postsConImagen.map((post) => (
          <PostCard 
            key={post.id} 
            item={post} 
            basePath={`/${postType}`} 
          />
        ))}
      </SliderBase>
    </section>
  );
}
