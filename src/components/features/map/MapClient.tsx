'use client';

/**
 * Client Component that renders a Mapbox GL map with pins.
 * Requires NEXT_PUBLIC_MAPBOX_TOKEN in environment.
 */

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { MapData } from '@/api/wordpressApi';

const STYLE_MAP: Record<string, string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
};

const MapWithMarkers = dynamic(
  () => import('./MapWithMarkers').then((m) => m.default),
  { ssr: false }
);

interface MapClientProps {
  data: MapData;
}

export default function MapClient({ data }: MapClientProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapStyle = STYLE_MAP[data.style] ?? STYLE_MAP.streets;

  const initialViewState = useMemo(() => {
    const hasCenter = data.center.lat != null && data.center.lng != null;
    if (hasCenter) {
      return {
        longitude: data.center.lng!,
        latitude: data.center.lat!,
        zoom: data.zoom,
      };
    }
    if (data.locations.length > 0) {
      const lngs = data.locations.map((l) => l.lng);
      const lats = data.locations.map((l) => l.lat);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      // Si todos los pins están en el mismo punto, añadir un pequeño delta
      const lngDelta = minLng === maxLng ? 0.01 : 0;
      const latDelta = minLat === maxLat ? 0.01 : 0;
      return {
        bounds: [
          [minLng - lngDelta, minLat - latDelta],
          [maxLng + lngDelta, maxLat + latDelta],
        ] as [[number, number], [number, number]],
        fitBoundsOptions: { padding: 160 }, // Change this to adjust the zoom level relativve to pins
      };
    }
    return { longitude: -3.7, latitude: 40.4, zoom: 4 };
  }, [data]);

  if (!token) {
    return (
      <div className="map-container map-error">
        <p>Map token not configured (NEXT_PUBLIC_MAPBOX_TOKEN)</p>
      </div>
    );
  }

  if (data.locations.length === 0) {
    return (
      <div className="map-container map-empty">
        <p>No locations to display</p>
      </div>
    );
  }

  return (
    <section className="map-section">
      <div
        className="map-container"
        style={{ height: data.height || '400px' }}
        data-lenis-prevent
      >
        <MapWithMarkers
          token={token}
          mapStyle={mapStyle}
          initialViewState={initialViewState}
          locations={data.locations}
          tooltipTrigger={data.tooltipTrigger}
          showZoomControls={data.showZoomControls ?? true}
          projection={data.projection ?? 'globe'}
          pinIcon={data.pinIcon ?? 'map-pin'}
          pinSize={data.pinSize ?? 32}
          pinFillColor={data.pinFillColor ?? '#dc2626'}
          pinStrokeColor={data.pinStrokeColor ?? '#ffffff'}
          pinStrokeWidth={data.pinStrokeWidth ?? 2}
        />
      </div>
    </section>
  );
}
