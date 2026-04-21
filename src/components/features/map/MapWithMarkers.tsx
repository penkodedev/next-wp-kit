'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import type { MapLocation } from '@/api/wordpressApi';
import type { LucideIcon } from 'lucide-react';
import {
  MapPin,
  MapPinCheck,
  MapPinCheckInside,
  MapPinHouse,
  MapPinMinusInside,
  MapPinPen,
  Locate,
  LocateFixed,
  Building2,
  Store,
  Hotel,
  Landmark,
  Hospital,
  CircleDot,
  Navigation,
  User,
  Circle,
  ShoppingBasket,
  ShoppingCart,
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const HOVER_CLOSE_DELAY_MS = 150;

const ICON_MAP: Record<string, LucideIcon> = {
  'map-pin': MapPin,
  'map-pin-check': MapPinCheck,
  'map-pin-check-inside': MapPinCheckInside,
  'map-pin-house': MapPinHouse,
  'map-pin-minus-inside': MapPinMinusInside,
  'map-pin-pen': MapPinPen,
  'locate': Locate,
  'locate-fixed': LocateFixed,
  'building-2': Building2,
  'store': Store,
  'hotel': Hotel,
  'landmark': Landmark,
  'hospital': Hospital,
  'circle-dot': CircleDot,
  'navigation': Navigation,
  'user': User,
  'circle': Circle,
  'shopping-basket': ShoppingBasket,
  'shopping-cart': ShoppingCart,
};

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
  projection?: 'globe' | 'mercator';
  pinIcon?: string;
  pinSize?: number;
  pinFillColor?: string;
  pinStrokeColor?: string;
  pinStrokeWidth?: number;
}

export default function MapWithMarkers({
  token,
  mapStyle,
  initialViewState,
  locations,
  tooltipTrigger,
  showZoomControls = true,
  projection = 'globe',
  pinIcon = 'map-pin',
  pinSize = 32,
  pinFillColor = '#dc2626',
  pinStrokeColor = '#ffffff',
  pinStrokeWidth = 2,
}: MapWithMarkersProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver covers layout-based size changes (viewport resize, etc.)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Poll resize during entry animations: CSS transform: scale() doesn't trigger
  // ResizeObserver (layout size doesn't change), but Mapbox reads getBoundingClientRect()
  // which returns scaled dimensions. Polling for ~2s covers any parent animation duration.
  useEffect(() => {
    const interval = setInterval(() => {
      mapRef.current?.resize();
    }, 100);
    const timeout = setTimeout(() => clearInterval(interval), 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleLoad = useCallback(() => {
    mapRef.current?.resize();
  }, []);

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
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={initialViewState}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
      projection={projection}
      onClick={handleMapClick}
      onLoad={handleLoad}
      attributionControl={false}
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
          pinIcon={pinIcon}
          pinSize={pinSize}
          pinFillColor={pinFillColor}
          pinStrokeColor={pinStrokeColor}
          pinStrokeWidth={pinStrokeWidth}
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
            <h3 className="map-popup-title">
              {selectedLocation.link ? (
                <Link href={selectedLocation.link} className="map-popup-title-link">
                  {selectedLocation.title}
                </Link>
              ) : (
                selectedLocation.title
              )}
            </h3>
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
    </div>
  );
}

function MapMarker({
  location,
  tooltipTrigger,
  onSelect,
  isSelected,
  pinIcon,
  pinSize,
  pinFillColor,
  pinStrokeColor,
  pinStrokeWidth,
}: {
  location: MapLocation;
  tooltipTrigger: 'hover' | 'click';
  onSelect: (loc: MapLocation | null, immediate?: boolean) => void;
  isSelected: boolean;
  pinIcon: string;
  pinSize: number;
  pinFillColor: string;
  pinStrokeColor: string;
  pinStrokeWidth: number;
}) {
  const Icon = ICON_MAP[pinIcon] ?? MapPin;

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
      >
        <Icon
          size={pinSize}
          color={pinStrokeColor}
          fill={pinFillColor}
          strokeWidth={pinStrokeWidth}
        />
      </div>
    </Marker>
  );
}
