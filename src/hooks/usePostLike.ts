// src/hooks/usePostLike.ts
'use client';

import { useState, useEffect } from 'react';
import { likePost } from '@/api/wordpressApi';

/**
 * Hook for managing post likes with localStorage to prevent spam
 * Allows up to 3 likes per post per user (client-side limitation)
 * 
 * @param postId - The WordPress post ID
 * @param initialLikes - Initial like count from server
 * @returns Object with like state and handlers
 */
export function usePostLike(postId: number, initialLikes: number) {
  const [likes, setLikes] = useState(initialLikes);
  const [userLikeCount, setUserLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `liked_post_${postId}`;

  // Load user's like count from localStorage
  useEffect(() => {
    const storedLikes = parseInt(localStorage.getItem(storageKey) || '0', 10);
    setUserLikeCount(storedLikes);
  }, [storageKey]);

  const canLike = userLikeCount < 3;

  const handleLike = async () => {
    if (!canLike || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await likePost(postId);
      
      if (response?.success) {
        setLikes(response.likes);
        
        const newCount = userLikeCount + 1;
        setUserLikeCount(newCount);
        localStorage.setItem(storageKey, newCount.toString());
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al dar like');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likes,
    handleLike,
    isLoading,
    error,
    canLike,
    userLikeCount,
  };
}
