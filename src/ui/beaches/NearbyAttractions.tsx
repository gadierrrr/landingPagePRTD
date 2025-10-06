import React from 'react';

interface NearbyAttraction {
  name: string;
  distance?: number; // in meters
  type: 'beach' | 'restaurant' | 'wildlife' | 'historic' | 'activity' | 'nature' | 'food' | 'shopping';
  description?: string;
}

interface NearbyAttractionsProps {
  attractions: NearbyAttraction[];
  municipality: string;
}

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m away`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)}km away`;
};

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'beach':
      return '🏖️';
    case 'restaurant':
    case 'food':
      return '🍴';
    case 'wildlife':
      return '🦜';
    case 'historic':
      return '🏛️';
    case 'activity':
      return '🎢';
    case 'nature':
      return '🌿';
    case 'shopping':
      return '🛍️';
    default:
      return '📍';
  }
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'beach':
      return 'Beach';
    case 'restaurant':
      return 'Restaurant';
    case 'food':
      return 'Food & Dining';
    case 'wildlife':
      return 'Wildlife';
    case 'historic':
      return 'Historic Site';
    case 'activity':
      return 'Activity';
    case 'nature':
      return 'Nature';
    case 'shopping':
      return 'Shopping';
    default:
      return 'Attraction';
  }
};

export const NearbyAttractions: React.FC<NearbyAttractionsProps> = ({ attractions, municipality }) => {
  if (!attractions || attractions.length === 0) {
    return null;
  }

  // Sort by distance (closest first), undefined distances go last
  const sortedAttractions = [...attractions].sort((a, b) => {
    if (a.distance === undefined) return 1;
    if (b.distance === undefined) return -1;
    return a.distance - b.distance;
  });

  return (
    <section className="border-brand-navy/10 border-b py-8">
      <h2 className="mb-2 text-2xl font-bold text-brand-navy">
        Explore the Area
      </h2>
      <p className="text-brand-navy/60 mb-6">
        Discover other attractions near {municipality}
      </p>
      <div className="space-y-4">
        {sortedAttractions.map((attraction, index) => (
          <div
            key={index}
            className="border-brand-navy/10 flex items-start gap-4 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="text-3xl" aria-hidden="true">
              {getTypeIcon(attraction.type)}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-brand-navy">{attraction.name}</h3>
                <span className="text-brand-navy/70 rounded-full bg-brand-sand px-2 py-0.5 text-xs font-medium">
                  {getTypeLabel(attraction.type)}
                </span>
                {attraction.distance !== undefined && (
                  <span className="text-xs font-medium text-brand-blue">
                    {formatDistance(attraction.distance)}
                  </span>
                )}
              </div>
              {attraction.description && (
                <p className="text-brand-navy/70 text-sm leading-relaxed">
                  {attraction.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
