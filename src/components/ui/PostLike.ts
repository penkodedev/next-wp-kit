// src/hooks/usePostLike.ts
import { useState, useEffect } from 'react';
import { likePost } from '@/api/api';

// Asumimos que el nonce se pasa desde el servidor o un contexto
export function usePostLike(postId: number, initialLikes: number, nonce: string) {
  const [likes, setLikes] = useState(initialLikes);
  const [userLikeCount, setUserLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `liked_recurso_${postId}`;

  // Cargar el estado inicial del localStorage
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
      const response = await likePost(postId, nonce);
      setLikes(response.new_count);
      
      const newCount = userLikeCount + 1;
      setUserLikeCount(newCount);
      localStorage.setItem(storageKey, newCount.toString());

    } catch (err: any) {
      setError(err.message);
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
