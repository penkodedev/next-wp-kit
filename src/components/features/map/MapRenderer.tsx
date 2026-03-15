// src/components/features/map/MapRenderer.tsx

/**
 * Server Component that fetches map data from the API
 * and renders the MapClient with all locations (pins).
 */

import { getMapData } from '@/api/wordpressApi';
import MapClient from './MapClient';

interface MapRendererProps {
  lang?: string;
}

export default async function MapRenderer({ lang }: MapRendererProps) {
  const data = await getMapData(lang);

  if (!data) return null;

  return <MapClient data={data} />;
}
