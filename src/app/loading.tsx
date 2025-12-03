// src/app/loading.tsx

/**
 * Global loading component
 * Next.js automatically shows this while any page is loading
 */

import LoadingSpinner from '@/components/ui/LoadingSpiner';

export default function Loading() {
  return (
    <div className="loading-page">
      <LoadingSpinner overlay />
    </div>
  );
}
