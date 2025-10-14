// src/components/ui/PostCardSkeleton.tsx

/**
 * A skeleton component that mimics the layout of a PostCard.
 * Used to provide a better loading state experience.
 */
export default function PostCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="card-image bg-gray-300 h-48"></div>
      <div className="card-content p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6 mt-1"></div>
      </div>
    </div>
  );
}