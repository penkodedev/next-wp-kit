'use client';

import { useState, useCallback, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import type { MapLocation } from '@/api/wordpressApi';
import 'mapbox-gl/dist/mapbox-gl.css';

const HOVER_CLOSE_DELAY_MS = 150;

interface MapWithMarkersProps {
  token: string;
  mapStyle: string;
  initialViewState:
    | { longitude: number; latitude: number; zoom: number }
    | {
        bounds: [[number, number], [number, number]];
        fitBoundsOptions?: { padding?: number };
      };
  locations: MapLocation[];
  tooltipTrigger: 'hover' | 'click';
  showZoomControls?: boolean;
}

export default function MapWithMarkers({
  token,
  mapStyle,
  initialViewState,
  locations,
  tooltipTrigger,
  showZoomControls = true,
}: MapWithMarkersProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setSelectedLocation(null), HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const handleSelect = useCallback(
    (loc: MapLocation | null, immediate = false) => {
      clearCloseTimer();
      if (immediate) {
        setSelectedLocation(loc);
      } else if (loc) {
        setSelectedLocation(loc);
      } else {
        scheduleClose();
      }
    },
    [clearCloseTimer, scheduleClose]
  );

  const handlePopupMouseEnter = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const handlePopupMouseLeave = useCallback(() => {
    if (tooltipTrigger === 'hover') {
      scheduleClose();
    }
  }, [tooltipTrigger, scheduleClose]);

  const handleMapClick = useCallback(() => {
    if (tooltipTrigger === 'click') {
      setSelectedLocation(null);
    }
  }, [tooltipTrigger]);

  const handlePopupClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Map
      mapboxAccessToken={token}
      initialViewState={initialViewState}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
      onClick={handleMapClick}
    >
      {showZoomControls && (
          <NavigationControl position="top-right" showCompass={false} showZoom />
        )}
      {locations.map((loc) => (
        <MapMarker
          key={loc.id}
          location={loc}
          tooltipTrigger={tooltipTrigger}
          onSelect={handleSelect}
          isSelected={selectedLocation?.id === loc.id}
        />
      ))}
      {selectedLocation && (
        <Popup
          longitude={selectedLocation.lng}
          latitude={selectedLocation.lat}
          anchor="top"
          closeButton={false}
          closeOnClick={false}
          onClose={() => setSelectedLocation(null)}
          maxWidth="280px"
        >
          <div
            className="map-popup"
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
            onClick={handlePopupClick}
          >
            <h3 className="map-popup-title">{selectedLocation.title}</h3>
            {selectedLocation.address && (
              <span className="map-popup-address">
                <a
                  href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-popup-address-link"
                >
                  {selectedLocation.address}
                </a>
              </span>
            )}
            {selectedLocation.description && (
              <div
                className="map-popup-desc"
                dangerouslySetInnerHTML={{ __html: selectedLocation.description }}
              />
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
}

function MapMarker({
  location,
  tooltipTrigger,
  onSelect,
  isSelected,
}: {
  location: MapLocation;
  tooltipTrigger: 'hover' | 'click';
  onSelect: (loc: MapLocation | null, immediate?: boolean) => void;
  isSelected: boolean;
}) {
  const handleClick = useCallback(
    (e: { originalEvent: MouseEvent }) => {
      e.originalEvent.stopPropagation();
      if (tooltipTrigger === 'click') {
        onSelect(isSelected ? null : location, true);
      }
    },
    [tooltipTrigger, isSelected, location, onSelect]
  );

  const handleMouseEnter = useCallback(() => {
    if (tooltipTrigger === 'hover') {
      onSelect(location, true);
    }
  }, [tooltipTrigger, location, onSelect]);

  const handleMouseLeave = useCallback(() => {
    if (tooltipTrigger === 'hover') {
      onSelect(null);
    }
  }, [tooltipTrigger, onSelect]);

  return (
    <Marker
      longitude={location.lng}
      latitude={location.lat}
      anchor="bottom"
      onClick={handleClick}
    >
      <div
        className="map-marker"
        title={location.title}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick({ originalEvent: e.nativeEvent as unknown as MouseEvent });
          }
        }}
      />
    </Marker>
  );
}
