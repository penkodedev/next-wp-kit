// src/components/sections/sliders/SliderCards.tsx

/**
 * Presentational card components for each slider type
 * (testimonials, media, custom).
 */

import Image from 'next/image';
import type { SliderSlide } from '@/api/wordpressApi';
import { Icons } from '@/components/ui/Icons';


// ----------------------------------------------------------
//  Testimonial
// ----------------------------------------------------------
// Every sub-element renders only when it has a value, so unused
// fields never pollute the layout. The optional link wraps the
// author block (name + role/company). The avatar is always rendered
// (with a User icon fallback when there is no featured image).

function TestimonialStars({ rating }: { rating: number }) {
  const safe = Math.max(0, Math.min(5, Math.round(rating)));
  if (safe === 0) return null;
  return (
    <p className="testimonial-rating" aria-label={`${safe} out of 5 stars`}>
      {'★'.repeat(safe)}{'☆'.repeat(5 - safe)}
    </p>
  );
}

export function CardTestimonial({ slide }: { slide: SliderSlide }) {
  const hasRoleOrCompany = slide.role || slide.company;
  const authorMeta = [slide.role, slide.company].filter(Boolean).join(' · ');

  const avatarBlock = (
    <div className={`testimonial-avatar${!slide.image_url ? ' testimonial-avatar--placeholder' : ''}`}>
      {slide.image_url ? (
        <Image
          src={slide.image_url}
          alt={slide.name || ''}
          fill
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <Icons.User
          className="testimonial-avatar-icon"
          strokeWidth={1.4}
          aria-hidden="true"
        />
      )}
    </div>
  );

  const authorBlock = (
    <div className="testimonial-author">
      {slide.name && <p><strong className="testimonial-name">{slide.name}</strong></p>}
      {hasRoleOrCompany && <p><span className="testimonial-role">{authorMeta}</span></p>}
    </div>
  );

  return (
    <div className="testimonial-card">
      {/* 1. Avatar (top) */}
      {avatarBlock}

      {/* 2. Rating + quote (middle) */}
      {typeof slide.rating === 'number' && slide.rating > 0 && (
        <TestimonialStars rating={slide.rating} />
      )}
      {slide.text && (
        <div className="testimonial-quote-wrap">
          <span className="testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
          <div
            className="testimonial-quote"
            dangerouslySetInnerHTML={{ __html: slide.text }}
          />
        </div>
      )}

      {/* 3. Author (bottom) — optional link wraps just the author block */}
      {slide.link ? (
        <a
          href={slide.link}
          target="_blank"
          rel="noopener noreferrer"
          className="testimonial-link"
        >
          {authorBlock}
        </a>
      ) : (
        authorBlock
      )}
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
