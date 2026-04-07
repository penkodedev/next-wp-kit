import { fetchAPI } from './client';

export interface MapLocation {
  id: number;
  title: string;
  lat: number;
  lng: number;
  address: string;
  description: string;
  link?: string | null;
}

export interface MapData {
  group: string | null;
  center: { lat: number | null; lng: number | null };
  zoom: number;
  clustering: boolean;
  style: string;
  height: string;
  tooltipTrigger: 'hover' | 'click';
  showZoomControls: boolean;
  projection: 'globe' | 'mercator';
  pinIcon: string;
  pinSize: number;
  pinFillColor: string;
  pinStrokeColor: string;
  pinStrokeWidth: number;
  locations: MapLocation[];
}

export async function getMapData(lang?: string, group?: string): Promise<MapData | null> {
  const params = new URLSearchParams();
  if (lang) params.set('lang', lang);
  if (group) params.set('group', group);
  const qs = params.toString();
  const endpoint = qs ? `/custom/v1/map?${qs}` : '/custom/v1/map';
  return await fetchAPI<MapData>(endpoint);
}
