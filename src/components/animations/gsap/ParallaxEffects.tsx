// src/components/animations/gsap/ParallaxEffects.tsx

'use client';

import { useEffect } from 'react';
import { gsap } from './gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ParallaxEffects() {
  useEffect(() => {
    const animated = new Set<Element>();
    const triggers: ScrollTrigger[] = [];

    const excludeSelectors = [
      '[data-no-parallax]',
      '.modal-content',
      '.advertising-popup',
    ];

    const selectors = [
      '.wp-block-cover .has-parallax',
      '.wp-block-cover > img',
      '[data-parallax]',
    ];

    const applyParallax = () => {
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          if (animated.has(el)) return;
          if (excludeSelectors.some((exc) => el.closest(exc))) return;
          animated.add(el);

          const speed = parseFloat(el.getAttribute('data-speed') ?? '') || 25;
          const triggerEl = el.closest('.wp-block-cover') ?? el;

          // 👇 NUEVO: Asegurar que el contenedor tenga overflow hidden
          const container = el.parentElement;
          if (container) {
            container.style.overflow = 'hidden';
          }

          // 👇 NUEVO: Escalar la imagen para compensar el movimiento
          const scale = 1 + (speed / 100);
          gsap.set(el, {
            scale: scale,
            yPercent: speed / 2, // Centramos la imagen inicialmente
          });

          const anim = gsap.to(el, {
            yPercent: -speed / 2, // Movemos desde arriba hacia abajo
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