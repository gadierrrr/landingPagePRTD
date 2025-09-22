import React from 'react';
import { Beach } from '../../lib/forms';
import { PublicBeachCard } from './PublicBeachCard';

interface PublicBeachesGridProps {
  beaches: Beach[];
  userLocation?: { lat: number; lng: number };
  onBeachDirectionsClick?: (beach: Beach, distance?: number) => void;
  onBeachDetailsClick?: (beach: Beach) => void;
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const PublicBeachesGrid: React.FC<PublicBeachesGridProps> = ({ 
  beaches, 
  userLocation,
  onBeachDirectionsClick,
  onBeachDetailsClick
}) => {
  // Calculate distances and sort if user location available
  const beachesWithDistance = React.useMemo(() => {
    if (!userLocation) {
      return beaches.map(beach => ({ beach, distance: undefined }));
    }
    
    return beaches
      .map(beach => ({
        beach,
        distance: calculateDistance(
          userLocation.lat, userLocation.lng,
          beach.coords.lat, beach.coords.lng
        )
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [beaches, userLocation]);

  if (beaches.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-6xl mb-4">🏖️</div>
        <h3 className="text-xl font-bold text-brand-navy mb-2">No beaches found</h3>
        <p className="text-brand-navy/60 max-w-md mx-auto">
          Try adjusting your filters or expanding your search distance to find more beaches.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {beachesWithDistance.map(({ beach, distance }) => (
        <PublicBeachCard
          key={beach.id}
          beach={beach}
          distance={distance}
          onDirectionsClick={() => onBeachDirectionsClick?.(beach, distance)}
          onDetailsClick={() => onBeachDetailsClick?.(beach)}
        />
      ))}
    </div>
  );
};