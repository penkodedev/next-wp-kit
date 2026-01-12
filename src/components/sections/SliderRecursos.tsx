// src/components/ui/SliderLatestRecursos.tsx

import { getAllContent } from "@/api/wordpressApi";
import PostCard from "@/components/ui/PostCard";
import type { WpContent } from "@/types/wordpressTypes";
import dynamic from "next/dynamic";
import type { SwiperOptions } from "swiper/types";

// Dynamically import SliderBase and disable SSR for it
const SliderBase = dynamic(() => import("@/components/ui/SliderBase"), {
  ssr: false,
});

interface SliderRecursosProps {
  title?: string;
  postType?: string;
  perPage?: number;
}

/**
 * A server component that fetches the latest resources
 * and displays them in a carousel.
 */
export default async function SliderLatestRecursos({
  title = "Latest Resources",
  postType = 'recursos', /* WordPress CUSTOM POST TYPE */
  perPage = 6
}: SliderRecursosProps) {

  // 1. Get the latest resources from WordPress API
  const params = `?per_page=${perPage}&page=1&_embed&orderby=date&order=desc`;
  const latestRecursos = await getAllContent<WpContent>(postType, params);

  // If no resources, don't show anything
  if (!latestRecursos || latestRecursos.length === 0) {
      return <p>No recent resources found.</p>;

  }

  // 2. Filter only resources that have featured images to ensure PostCard looks good
  const recursosConImagen = latestRecursos.filter(
    (recurso) => recurso._embedded?.["wp:featuredmedia"]?.[0]?.source_url
  );


  // 3. Define configuration
  const sliderOptions: SwiperOptions = {
    slidesPerView: 3.7, // Allows slides to flow with their natural width
    speed: 7000, // Increase duration for smooth slow movement
    freeMode: true,
    navigation: false,
    pagination: { clickable: true },
    loop: true,
    loopAdditionalSlides: 1, // Important! Helps make the loop fluid without jumps
    allowTouchMove: true, // Disables manual drag for pure marquee effect
    autoplay: {
      delay: 0, disableOnInteraction: false,

    },

// =================================================================
//                      Responsive Breakpoints
// =================================================================

        breakpoints: {
          // Large desktop (1920px+)
          1920: {
            slidesPerView: 3.6,
          },
          // Normal desktop (1440px+)
          1440: {
            slidesPerView: 2.7,
          },
          // Small desktop (1024px+)
          1024: {
            slidesPerView: 2,
          },
          // Tablet (768px+)
          768: {
            slidesPerView: 1.7,
          },
          // Large mobile (640px+)
          640: {
            slidesPerView: 1.4,
          },
          // Small mobile (base)
          320: {
            slidesPerView: 1,
          },
    },
         };

  // 3. Render the client SliderBase component with pre-loaded data
  // Create PostCards here and pass them as children to SliderBase
  return (
    <div className="slider-recursos">
      {title && <h2 className="slider-title">{title}</h2>}
      <SliderBase swiperOptions={sliderOptions}>
        {recursosConImagen.map((recurso) => (
          <PostCard key={recurso.id} item={recurso} basePath={`/${postType}`} />
        ))}
      </SliderBase>
    </div>
  );
}

