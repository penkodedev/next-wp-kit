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
      const elements = gsap.utils.toArray<HTMLElement>(
        'h1, h2, h3, h4, p, img, ul, ol, blockquote, section, .post-card, .footer-box, .wp-block-group, .wp-block-cover, .wp-block-cover__image-background, swiper-wrapper'
      )

      elements.forEach((el) => {
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
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
