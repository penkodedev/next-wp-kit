// src/components/ui/LikeButton.tsx
import { HeartIcon } from './Icons'; // Asumimos que tenemos un componente de iconos

interface LikeButtonProps {
  count: number;
  onLike: () => void;
  isLoading?: boolean;
  canLike?: boolean;
  'aria-label'?: string;
}

export function LikeButton({
  count,
  onLike,
  isLoading = false,
  canLike = true,
  'aria-label': ariaLabel = 'Dar me gusta',
}: LikeButtonProps) {
  const isDisabled = isLoading || !canLike;

  return (
    <button
      onClick={onLike}
      disabled={isDisabled}
      className={`like-button ${isDisabled ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`}
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <HeartIcon />
      <span className="like-count">{count}</span>
      {isLoading && <span className="spinner"></span>}
    </button>
  );
}
