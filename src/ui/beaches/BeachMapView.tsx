import React, { useEffect, useRef } from 'react';
import maplibregl, { Map as MapLibreMap, Marker, LngLatBounds } from 'maplibre-gl';
import { Beach } from '../../lib/forms';

interface BeachMapViewProps {
  beaches: Beach[];
  userLocation?: { lat: number; lng: number };
  selectedBeach?: Beach | null;
  onBeachDetailsClick?: (beach: Beach) => void;
}

const MAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const INITIAL_CENTER: [number, number] = [-66.5901, 18.2208];

type BeachMarkerRecord = {
  beach: Beach;
  marker: Marker;
  element: HTMLButtonElement;
};

export const BeachMapView: React.FC<BeachMapViewProps> = ({
  beaches,
  userLocation,
  selectedBeach,
  onBeachDetailsClick
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<BeachMarkerRecord[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);

  // Initialise the map once the component mounts on the client
  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: 8,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    return () => {
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Place markers for beaches and fit bounds whenever the dataset changes
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    if (beaches.length === 0) {
      return;
    }

    const bounds = new LngLatBounds();

    beaches.forEach((beach) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'prtd-map-marker';
      element.title = `${beach.name} – ${beach.municipality}`;
      element.setAttribute('aria-label', `${beach.name} beach marker`);

      element.addEventListener('click', () => {
        onBeachDetailsClick?.(beach);
      });

      const marker = new maplibregl.Marker({ element, anchor: 'bottom' })
        .setLngLat([beach.coords.lng, beach.coords.lat])
        .addTo(mapRef.current!);

      markersRef.current.push({ beach, marker, element });
      bounds.extend([beach.coords.lng, beach.coords.lat]);
    });

    if (userLocation) {
      bounds.extend([userLocation.lng, userLocation.lat]);
    }

    if (!bounds.isEmpty()) {
      if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
        mapRef.current.easeTo({ center: bounds.getCenter(), zoom: Math.max(mapRef.current.getZoom(), 12), duration: 700 });
      } else {
        mapRef.current.fitBounds(bounds, { padding: 64, maxZoom: 13, duration: 800 });
      }
    }
  }, [beaches, userLocation, onBeachDetailsClick]);

  // Highlight the active beach and gently move the camera towards it
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    markersRef.current.forEach(({ beach, element }) => {
      const isActive = Boolean(selectedBeach && (selectedBeach.id === beach.id || selectedBeach.slug === beach.slug));
      element.classList.toggle('is-active', isActive);
    });

    if (selectedBeach) {
      mapRef.current.easeTo({
        center: [selectedBeach.coords.lng, selectedBeach.coords.lat],
        zoom: Math.max(mapRef.current.getZoom(), 12),
        duration: 600
      });
    }
  }, [selectedBeach]);

  // Render the user's location marker when available
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    userMarkerRef.current?.remove();
    userMarkerRef.current = null;

    if (!userLocation) {
      return;
    }

    const element = document.createElement('div');
    element.className = 'prtd-map-user-marker';
    element.title = 'Your location';

    userMarkerRef.current = new maplibregl.Marker({ element })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(mapRef.current);
  }, [userLocation]);

  return (
    <div className="prtd-map-wrapper">
      <div ref={containerRef} className="prtd-map-container" aria-label="Beach locations map" />
      <div className="prtd-map-legend">
        <div className="flex items-center gap-2">
          <span className="prtd-map-marker prtd-map-marker-static" aria-hidden />
          <span className="text-sm font-semibold text-brand-navy">Beaches</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2">
            <span className="prtd-map-user-marker prtd-map-user-marker-static" aria-hidden />
            <span className="text-brand-navy/70 text-sm">Your location</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeachMapView;
