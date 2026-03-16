// src/components/features/counter-stats/CounterStatCard.tsx

/**
 * Client Component that animates a single counter number on scroll
 * using IntersectionObserver and requestAnimationFrame with easing.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface CounterStatCardProps {
  number: number;
  label: string;
  suffix?: string;
  duration?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function formatNumber(value: number, isDecimal: boolean): string {
  if (isDecimal) return value.toFixed(1);
  return Math.round(value).toLocaleString();
}

export default function CounterStatCard({ number, label, suffix, duration = 2000 }: CounterStatCardProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const animationId = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isDecimal = number % 1 !== 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          cancelAnimationFrame(animationId.current);

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const current = easeOutCubic(progress) * number;

            setDisplayValue(formatNumber(current, isDecimal));

            if (progress < 1) {
              animationId.current = requestAnimationFrame(tick);
            }
          }

          animationId.current = requestAnimationFrame(tick);
        } else {
          

          // *******  To animate only once, comment the two lines below. **********//
          cancelAnimationFrame(animationId.current);
          setDisplayValue('0');
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationId.current);
    };
  }, [number, duration]);

  return (
    <div className="counter-stat-card" ref={ref}>
      {/* <h4 className="counter-stat-number">{displayValue}{suffix ?? ''}</h4> */}
      <h4 className="counter-stat-number">{displayValue}{suffix ? ` ${suffix}` : ''}</h4>
      {label && <p className="counter-stat-label">{label}</p>}
    </div>
  );
}
