import React, { useEffect, useRef } from 'react';
import type { Map as MapLibreMap, Marker, LngLatLike } from 'maplibre-gl';
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
  const maplibreRef = useRef<typeof import('maplibre-gl') | null>(null);

  // Initialise the map once the component mounts on the client
  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    let isMounted = true;

    import('maplibre-gl').then((module) => {
      if (!isMounted || !containerRef.current) {
        return;
      }

      const maplibre = module.default ?? module;
      maplibreRef.current = maplibre;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: INITIAL_CENTER,
        zoom: 8,
        attributionControl: false
      });

      // Handle map style load errors
      map.on('error', (e) => {
        console.error('Map error:', e);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="prtd-map-fallback" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 1rem;">
              <div style="font-size: 2rem;">🗺️</div>
              <div style="font-weight: 600;">Failed to load map tiles</div>
              <div style="font-size: 0.875rem; opacity: 0.7;">Please check your internet connection</div>
            </div>
          `;
        }
      });

      map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
      mapRef.current = map;
    }).catch((error) => {
      console.error('Failed to load MapLibre:', error);
    });

    return () => {
      isMounted = false;
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      maplibreRef.current = null;
    };
  }, []);

  // Place markers for beaches and fit bounds whenever the dataset changes
  useEffect(() => {
    const map = mapRef.current;
    const maplibre = maplibreRef.current;
    if (!map || !maplibre) {
      return;
    }

    // Clean up old markers and their event listeners
    markersRef.current.forEach(({ marker, element }) => {
      // Remove event listeners by cloning and replacing the element
      const newElement = element.cloneNode(true) as HTMLButtonElement;
      element.parentNode?.replaceChild(newElement, element);
      marker.remove();
    });
    markersRef.current = [];

    if (beaches.length === 0) {
      return;
    }

    const bounds = new maplibre.LngLatBounds();
    const clickHandlers = new Map<HTMLButtonElement, () => void>();

    beaches.forEach((beach) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'prtd-map-marker';
      element.title = `${beach.name} – ${beach.municipality}`;
      element.setAttribute('aria-label', `${beach.name} beach marker`);

      const clickHandler = () => {
        onBeachDetailsClick?.(beach);
      };
      element.addEventListener('click', clickHandler);
      clickHandlers.set(element, clickHandler);

      const marker = new maplibre.Marker({ element, anchor: 'bottom' })
        .setLngLat([beach.coords.lng, beach.coords.lat] as LngLatLike)
        .addTo(map);

      markersRef.current.push({ beach, marker, element });
      bounds.extend([beach.coords.lng, beach.coords.lat]);
    });

    if (userLocation) {
      bounds.extend([userLocation.lng, userLocation.lat]);
    }

    if (!bounds.isEmpty()) {
      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();
      const isSinglePoint = northEast.lat === southWest.lat && northEast.lng === southWest.lng;

      if (isSinglePoint) {
        map.easeTo({ center: bounds.getCenter(), zoom: Math.max(map.getZoom(), 12), duration: 700 });
      } else {
        map.fitBounds(bounds, { padding: 64, maxZoom: 13, duration: 800 });
      }
    }

    // Cleanup function
    return () => {
      clickHandlers.forEach((handler, element) => {
        element.removeEventListener('click', handler);
      });
    };
  }, [beaches, userLocation, onBeachDetailsClick]);

  // Highlight the active beach and gently move the camera towards it
  useEffect(() => {
    const map = mapRef.current;
    const maplibre = maplibreRef.current;
    if (!map || !maplibre) {
      return;
    }

    markersRef.current.forEach(({ beach, element }) => {
      const isActive = Boolean(selectedBeach && (selectedBeach.id === beach.id || selectedBeach.slug === beach.slug));
      element.classList.toggle('is-active', isActive);
    });

    if (selectedBeach) {
      map.easeTo({
        center: [selectedBeach.coords.lng, selectedBeach.coords.lat],
        zoom: Math.max(map.getZoom(), 12),
        duration: 600
      });
    }
  }, [selectedBeach]);

  // Render the user's location marker when available
  useEffect(() => {
    const map = mapRef.current;
    const maplibre = maplibreRef.current;
    if (!map || !maplibre) {
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

    userMarkerRef.current = new maplibre.Marker({ element })
      .setLngLat([userLocation.lng, userLocation.lat] as LngLatLike)
      .addTo(map);
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
