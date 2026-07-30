// src/utils/wordpress/heroHelpers.ts

export function decodeHTML(html: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };
  return html.replace(/&[^;]+;/g, (entity) => entities[entity] || entity);
}

export function normalizeHeroSlide(slide: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(slide)) {
    if (value === undefined || value === null) continue;

    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    if (key.includes('_')) {
      result[camelKey] = value;
    } else if (!(camelKey in result)) {
      result[camelKey] = value;
    }
  }

  return result;
}

export function getNormalizedSlideData<T extends Record<string, unknown>>(
  slide: T,
  fallback?: Partial<T>
): Record<string, unknown> {
  const normalized = normalizeHeroSlide(slide);
  if (fallback) {
    return { ...normalized, ...fallback };
  }
  return normalized;
}

export function useSmoothScroll(targetId: string, duration = 1000) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    const start = window.scrollY;
    const targetTop = target.offsetTop;
    const distance = targetTop - start;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      window.scrollTo(0, start + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return { handleClick };
}
