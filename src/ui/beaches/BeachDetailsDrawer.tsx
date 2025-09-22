import React, { useEffect } from 'react';
import { Beach } from '../../lib/forms';
import { TAG_LABELS, AMENITY_LABELS, CONDITION_LABELS } from '../../constants/beachVocab';

interface BeachDetailsDrawerProps {
  beach: Beach | null;
  isOpen: boolean;
  onClose: () => void;
  distance?: number;
  onDirectionsClick?: () => void;
}

export const BeachDetailsDrawer: React.FC<BeachDetailsDrawerProps> = ({
  beach,
  isOpen,
  onClose,
  distance,
  onDirectionsClick
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !beach) {
    return null;
  }

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    const km = meters / 1000;
    return `${km.toFixed(1)}km away`;
  };

  const handleDirectionsClick = () => {
    const mapsUrl = `https://maps.apple.com/?daddr=${beach.coords.lat},${beach.coords.lng}&dirflg=d`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    
    if (onDirectionsClick) {
      onDirectionsClick();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="beach-details-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="relative">
          {beach.coverImage && (
            <div className="aspect-[16/9] relative overflow-hidden rounded-t-xl">
              <img 
                src={beach.coverImage} 
                alt={beach.name}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                aria-label="Close beach details"
              >
                ×
              </button>
              
              {/* Distance badge */}
              {distance !== undefined && (
                <div className="absolute left-3 top-3 rounded-full bg-brand-blue px-3 py-1 text-sm font-bold text-white">
                  {formatDistance(distance)}
                </div>
              )}
              
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 id="beach-details-title" className="text-2xl font-bold text-white">
                  {beach.name}
                </h2>
                <p className="text-white/90">{beach.municipality}</p>
              </div>
            </div>
          )}
          
          {!beach.coverImage && (
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h2 id="beach-details-title" className="text-2xl font-bold text-brand-navy">
                  {beach.name}
                </h2>
                <p className="text-brand-navy/60">{beach.municipality}</p>
              </div>
              <button
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full text-brand-navy/60 hover:bg-brand-sand transition-colors"
                aria-label="Close beach details"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tags */}
          {beach.tags && beach.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-brand-navy mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {beach.tags.map(tag => (
                  <span 
                    key={tag}
                    className="inline-flex rounded-full bg-brand-sand px-3 py-1 text-sm font-medium text-brand-navy"
                  >
                    {TAG_LABELS[tag] || tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {beach.amenities && beach.amenities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-brand-navy mb-2">Amenities</h3>
              <div className="grid grid-cols-2 gap-2">
                {beach.amenities.map(amenity => (
                  <div key={amenity} className="flex items-center text-sm text-brand-navy/80">
                    <span className="mr-2">✓</span>
                    {AMENITY_LABELS[amenity] || amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Conditions */}
          {(beach.sargassum || beach.surf || beach.wind) && (
            <div>
              <h3 className="text-sm font-semibold text-brand-navy mb-2">Current Conditions</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {beach.sargassum && (
                  <div className="text-center">
                    <div className="text-xs text-brand-navy/60 mb-1">Sargassum</div>
                    <div className="text-sm font-medium text-brand-navy">
                      {CONDITION_LABELS.sargassum[beach.sargassum]}
                    </div>
                  </div>
                )}
                {beach.surf && (
                  <div className="text-center">
                    <div className="text-xs text-brand-navy/60 mb-1">Surf</div>
                    <div className="text-sm font-medium text-brand-navy">
                      {CONDITION_LABELS.surf[beach.surf]}
                    </div>
                  </div>
                )}
                {beach.wind && (
                  <div className="text-center">
                    <div className="text-xs text-brand-navy/60 mb-1">Wind</div>
                    <div className="text-sm font-medium text-brand-navy">
                      {CONDITION_LABELS.wind[beach.wind]}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {beach.notes && (
            <div>
              <h3 className="text-sm font-semibold text-brand-navy mb-2">Additional Info</h3>
              <p className="text-sm text-brand-navy/80 leading-relaxed">{beach.notes}</p>
            </div>
          )}

          {/* Gallery */}
          {beach.gallery && beach.gallery.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-brand-navy mb-2">Gallery</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {beach.gallery.map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg">
                    <img 
                      src={image} 
                      alt={`${beach.name} - Image ${index + 1}`}
                      className="size-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleDirectionsClick}
              className="w-full rounded-lg bg-brand-blue px-6 py-3 text-center font-semibold text-white hover:bg-brand-navy transition-colors"
            >
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};