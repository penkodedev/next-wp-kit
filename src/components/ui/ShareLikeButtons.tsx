// src/components/ui/ShareLikeButtons.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Icons } from '@/components/ui/Icons';

/**
 * Client Component wrapper for Share and Like buttons
 * Extracted to allow parent components to remain Server Components
 */
export default function ShareLikeButtons() {
  const t = useTranslations('Content');

  return (
    <div className="icons-wrap">
      <Icons.Share2
        size={21}
        strokeWidth={1.5}
        className="icons-page-title icon-share"
        aria-label={t('share')}
      />
      <Icons.Heart
        size={21}
        strokeWidth={1.5}
        className="icons-page-title icon-heart"
        aria-label={t('like')}
      />
    </div>
  );
}
