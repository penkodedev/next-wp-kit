'use client';

import { useEffect } from 'react';
import { gsap } from './gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ParallaxEffects() {
  useEffect(() => {
    const animated = new Set<Element>();
    const triggers: ScrollTrigger[] = [];

    const applyParallax = () => {
      const selectors = [
        '.wp-block-cover__image-background',
        '.wp-block-cover > img',
        '.wp-block-column img',
        '[data-parallax]',
      ];

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          if (animated.has(el)) return;
          animated.add(el);

          const speed = parseFloat(el.getAttribute('data-speed') ?? '') || 25; // ******** More or less speed based on preference
          const triggerEl = el.closest('.wp-block-cover') ?? el;

          const anim = gsap.to(el, {
            yPercent: -speed,
            ease: 'none',
            scrollTrigger: {
              trigger: triggerEl,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,
            },
          });

          if (anim.scrollTrigger) triggers.push(anim.scrollTrigger);
        });
      });
    };

    applyParallax();

    let debounceTimer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyParallax, 150);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
      triggers.forEach((st) => st.kill());
    };
  }, []);

  return null;
}