// src/components/sections/sliders/SliderCards.tsx

/**
 * Presentational card components for each slider type
 * (testimonials, media, custom).
 */

import Image from 'next/image';
import type { SliderSlide } from '@/api/wordpressApi';


// ----------------------------------------------------------
//  Testimonial
// ----------------------------------------------------------

export function CardTestimonial({ slide }: { slide: SliderSlide }) {
  return (
    <div className="testimonial-card">
      {slide.image_url && (
        <div className="testimonial-avatar">
          <Image
            src={slide.image_url}
            alt={slide.name || ''}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      {slide.text && (
        <p className="testimonial-quote">
          {slide.text}
        </p>
      )}
      <div className="testimonial-author">
        {slide.name && <p><strong className="testimonial-name">{slide.name}</strong></p>}
        {slide.role && <p><span className="testimonial-role">{slide.role}</span></p>}
      </div>
    </div>
  );
}


// ----------------------------------------------------------
//  Media (images, logos, any visual)
// ----------------------------------------------------------

export function CardMedia({ slide }: { slide: SliderSlide }) {
  if (!slide.image_url) return null;

  const image = (
    <figure className="media-slide">
      <Image
        src={slide.image_url}
        alt={slide.alt || slide.caption || ''}
        width={800}
        height={600}
        className="media-image"
      />
      {slide.caption && <figcaption>{slide.caption}</figcaption>}
    </figure>
  );

  return slide.link ? (
    <a href={slide.link} target="_blank" rel="noopener noreferrer" className="media-slide-link">
      {image}
    </a>
  ) : (
    image
  );
}


// ----------------------------------------------------------
//  Custom
// ----------------------------------------------------------

export function CardCustom({ slide }: { slide: SliderSlide }) {
  return (
    <div className="slider-custom-slide">
      {slide.image_url && (
        <Image
          src={slide.image_url}
          alt={slide.title || ''}
          width={600}
          height={400}
          style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
        />
      )}
      {slide.title && <h3>{slide.title}</h3>}
      {slide.text && <div dangerouslySetInnerHTML={{ __html: slide.text }} />}
      {slide.link && (
        <a href={slide.link} target="_blank" rel="noopener noreferrer" className="slider-custom-link">
          →
        </a>
      )}
    </div>
  );
}
