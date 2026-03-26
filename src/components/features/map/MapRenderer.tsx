// src/components/features/map/MapRenderer.tsx

/**
 * Server Component that fetches map data from the API
 * and renders the MapClient with all locations (pins).
 * Optional `group` slug filters to a specific map_group taxonomy term.
 */

import { getMapData } from '@/api/wordpressApi';
import MapClient from './MapClient';

interface MapRendererProps {
  lang?: string;
  group?: string;
}

export default async function MapRenderer({ lang, group }: MapRendererProps) {
  const data = await getMapData(lang, group);

  if (!data) return null;

  return <MapClient data={data} />;
}
