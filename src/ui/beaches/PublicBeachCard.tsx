import React from 'react';
import { Beach } from '../../lib/forms';
import { TAG_LABELS, AMENITY_LABELS, CONDITION_LABELS } from '../../constants/beachVocab';

interface PublicBeachCardProps {
  beach: Beach;
  distance?: number; // in meters
  onDirectionsClick?: () => void;
  onDetailsClick?: () => void;
}

export const PublicBeachCard: React.FC<PublicBeachCardProps> = ({ 
  beach, 
  distance,
  onDirectionsClick,
  onDetailsClick
}) => {
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    const km = meters / 1000;
    return `${km.toFixed(1)}km`;
  };

  const getConditionColor = (condition: string, type: 'sargassum' | 'surf' | 'wind') => {
    if (!condition) return '';
    
    switch (type) {
      case 'sargassum':
        return condition === 'none' ? 'bg-green-100 text-green-800' :
               condition === 'light' ? 'bg-yellow-100 text-yellow-800' :
               condition === 'moderate' ? 'bg-orange-100 text-orange-800' :
               'bg-red-100 text-red-800';
      case 'surf':
        return condition === 'calm' ? 'bg-blue-100 text-blue-800' :
               'bg-teal-100 text-teal-800';
      case 'wind':
        return condition === 'calm' || condition === 'light' ? 'bg-green-100 text-green-800' :
               'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Generate Apple Maps / Google Maps link
    const mapsUrl = `https://maps.apple.com/?daddr=${beach.coords.lat},${beach.coords.lng}&dirflg=d`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    
    if (onDirectionsClick) {
      onDirectionsClick();
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDetailsClick) {
      onDetailsClick();
    }
  };

  return (
    <div className="ring-brand-navy/10 hover:ring-brand-blue/20 group relative cursor-pointer overflow-hidden rounded-xl bg-white ring-1 transition-all duration-200 hover:shadow-md">
      {/* 16:9 Aspect Ratio Image */}
      <div className="to-brand-navy/20 relative aspect-[16/9] overflow-hidden rounded-xl bg-[#0A2A29] bg-gradient-to-br from-[#0A2A29]">
        <img 
          src={beach.coverImage} 
          alt={beach.name}
          className="size-full object-cover object-center"
          loading="lazy"
        />
        
        {/* Distance Badge */}
        {distance !== undefined && (
          <div className="absolute right-3 top-3 rounded-full bg-brand-blue px-2 py-1 text-xs font-bold text-white shadow-lg">
            {formatDistance(distance)}
          </div>
        )}
        
        {/* Municipality Badge */}
        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
          {beach.municipality}
        </div>
      </div>
      
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 flex-1 text-lg font-bold leading-tight text-brand-navy transition-colors group-hover:text-brand-blue">
            {beach.name}
          </h3>
        </div>
        
        {/* Tags */}
        {beach.tags && beach.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {beach.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="inline-flex rounded-full bg-brand-sand px-2 py-1 text-xs font-medium text-brand-navy"
              >
                {TAG_LABELS[tag] || tag}
              </span>
            ))}
            {beach.tags.length > 3 && (
              <span className="inline-flex rounded-full bg-brand-sand px-2 py-1 text-xs font-medium text-brand-navy/60">
                +{beach.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Conditions */}
        {(beach.sargassum || beach.surf || beach.wind) && (
          <div className="flex flex-wrap gap-1">
            {beach.sargassum && (
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getConditionColor(beach.sargassum, 'sargassum')}`}>
                {CONDITION_LABELS.sargassum[beach.sargassum]}
              </span>
            )}
            {beach.surf && (
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getConditionColor(beach.surf, 'surf')}`}>
                {CONDITION_LABELS.surf[beach.surf]}
              </span>
            )}
            {beach.wind && (
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getConditionColor(beach.wind, 'wind')}`}>
                {CONDITION_LABELS.wind[beach.wind]}
              </span>
            )}
          </div>
        )}
        
        {/* Amenities */}
        {beach.amenities && beach.amenities.length > 0 && (
          <div className="text-brand-navy/60 flex flex-wrap gap-1 text-xs">
            {beach.amenities.slice(0, 4).map(amenity => (
              <span key={amenity} className="inline-flex items-center">
                {AMENITY_LABELS[amenity] || amenity}
              </span>
            )).reduce((prev, curr, index) => 
              index === 0 ? [curr] : [...prev, <span key={`sep-${index}`} className="text-brand-navy/30">•</span>, curr], 
              [] as React.ReactNode[]
            )}
            {beach.amenities.length > 4 && (
              <>
                <span className="text-brand-navy/30">•</span>
                <span className="text-brand-navy/60">+{beach.amenities.length - 4} more</span>
              </>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleDirectionsClick}
            className="bg-brand-blue hover:bg-brand-navy flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors"
          >
            Directions
          </button>
          <button
            onClick={handleDetailsClick}
            className="bg-brand-navy/10 hover:bg-brand-blue hover:text-white rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};