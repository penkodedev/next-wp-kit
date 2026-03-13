// src/app/loading.tsx

import { getAppearanceSettings } from '@/api/wordpressApi';
import LoadingSpinner from '@/components/ui/LoadingSpiner';

export default async function Loading() {
  const appearance = await getAppearanceSettings();
  if (appearance?.loading === false) return null;

  return (
    <div className="loading-page">
      <LoadingSpinner overlay />
    </div>
  );
}
