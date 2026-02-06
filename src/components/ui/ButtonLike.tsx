// src/components/ui/ButtonLike.tsx
'use client';

import { usePostLike } from '@/hooks/usePostLike';
import { Icons } from '@/components/ui/Icons';
import { useTranslations } from 'next-intl';

interface ButtonLikeProps {
  postId: number;
  initialLikes: number;
  className?: string;
}

/**
 * Simple like button with counter
 * Shows number above heart icon
 * Allows up to 3 likes per user (localStorage)
 */
export default function ButtonLike({ postId, initialLikes, className = '' }: ButtonLikeProps) {
  const t = useTranslations('Content');
  const { likes, handleLike, isLoading, canLike, userLikeCount } = usePostLike(postId, initialLikes);

  return (
    <a
      href="#like"
      className={`icons-page-title icon-heart ${canLike ? '' : 'disabled'} ${isLoading ? 'loading' : ''} ${userLikeCount > 0 ? 'liked' : ''} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        if (canLike && !isLoading) {
          handleLike();
        }
      }}
      aria-label={t('like')}
      title={canLike ? `${3 - userLikeCount} likes restantes` : 'Límite alcanzado'}
    >
      {likes > 0 && <p className="like-count">{likes}</p>}
      <Icons.Heart
        size={18}
        strokeWidth={1.5}
        fill={userLikeCount > 0 ? 'currentColor' : 'none'}
      />
    </a>
  );
}

