// src/components/animations/gsap/ScrollReveal.tsx

'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/components/animations/gsap/gsap'

type Props = {
  children: ReactNode
}

export default function WpReveal({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const selector = [
        'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'blockquote', 'button', 'svg', 'hr', 'table',
        'section', '.post-card', '.footer-box',
        '.wp-block-column', '.wp-block-image', '.wp-block-cover h1', '.wp-block-cover p', 'pre.wp-block-code',
        'swiper-wrapper',
      ].join(', ')

      const container = containerRef.current
      if (!container) return

      const elements = container.querySelectorAll<HTMLElement>(selector)

      elements.forEach((el) => {
        gsap.fromTo(
          el,

          // ─── INITIAL STATE (hidden) ────────────────────────────────────────
          {
            opacity: 0.2,
            y: 0,
            scale: 0.95,
          },

          // ─── FINAL STATE (visible) + ANIMATION CONFIG ─────────────────────
          {
            opacity: 1,
            y: 0,
            scale: 1,

            duration: 0.8,
            ease: 'power3.out', // easing curve:
                                //   'power1.out' → subtle
                                //   'power3.out' → smooth and natural (current)
                                //   'power4.out' → fast start, slow finish
                                //   'expo.out'   → very fast start, almost freeze at end
                                //   'bounce.out' → bouncy landing
                                //   'back.out(1.7)' → slight overshoot before settling

            scrollTrigger: {
              trigger: el,

              // ─── TRIGGER POINT ───────────────────────────────────────────
              // Format: 'element-edge viewport-edge'
              // 'top 100%'  → animates as soon as the top of the element hits the bottom of viewport
              // 'top 80%'   → animates when element is 20% into the viewport
              // 'center center' → animates when element reaches the middle of the screen
              start: 'top 100%',

              // ─── SCROLL ACTIONS ──────────────────────────────────────────
              // Controls what happens at 4 scroll events:
              // [onEnter, onLeave, onEnterBack, onLeaveBack]
              //
              // 'play'    → plays the animation forward
              // 'reverse' → plays the animation backwards
              // 'pause'   → freezes wherever it is
              // 'reset'   → jumps back to initial state
              // 'none'    → does nothing
              //
              // Current: plays forward when entering, reverses when leaving in any direction
              toggleActions: 'play none play none',
            },
          }
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    // Add style={{ perspective: '1200px' }} here to make rotationX look correct
    <div ref={containerRef}>
      {children}
    </div>
  )
}
