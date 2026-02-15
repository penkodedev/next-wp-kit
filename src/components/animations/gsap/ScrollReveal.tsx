'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/components/animations/gsap/gsap'

type Props = {
  content: string
}

export default function WpReveal({ content }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const selector = [
        'h1', 'h2', 'h3', 'h4', 'p', 'img', 'ul', 'ol', 'blockquote', 'button',
        'section', '.post-card', '.footer-box',
        '.wp-block-group', '.wp-block-column', '.wp-block-cover', '.wp-block-cover__image-background',
        'swiper-wrapper',
      ].join(', ')

      const elements = gsap.utils.toArray<HTMLElement>(selector)

      elements.forEach((el) => {
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: 100,
            scale: 0.95,
            rotationX: 5,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration: 1.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 100%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}
