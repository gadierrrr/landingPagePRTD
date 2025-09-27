import React, { useEffect } from 'react';
import Image from 'next/image';
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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="relative">
          {beach.coverImage && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
              <Image 
                src={beach.coverImage} 
                alt={beach.name}
                fill
                unoptimized={process.env.NODE_ENV === 'development'}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                onError={(e) => {
                  console.error('Beach details image failed to load:', beach.coverImage, e);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
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
              <div className="absolute inset-x-0 bottom-0 p-4">
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
                className="text-brand-navy/60 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-brand-sand"
                aria-label="Close beach details"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Tags */}
          {beach.tags && beach.tags.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-brand-navy">Features</h3>
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
              <h3 className="mb-2 text-sm font-semibold text-brand-navy">Amenities</h3>
              <div className="grid grid-cols-2 gap-2">
                {beach.amenities.map(amenity => (
                  <div key={amenity} className="text-brand-navy/80 flex items-center text-sm">
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
              <h3 className="mb-2 text-sm font-semibold text-brand-navy">Current Conditions</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {beach.sargassum && (
                  <div className="text-center">
                    <div className="text-brand-navy/60 mb-1 text-xs">Sargassum</div>
                    <div className="text-sm font-medium text-brand-navy">
                      {CONDITION_LABELS.sargassum[beach.sargassum]}
                    </div>
                  </div>
                )}
                {beach.surf && (
                  <div className="text-center">
                    <div className="text-brand-navy/60 mb-1 text-xs">Surf</div>
                    <div className="text-sm font-medium text-brand-navy">
                      {CONDITION_LABELS.surf[beach.surf]}
                    </div>
                  </div>
                )}
                {beach.wind && (
                  <div className="text-center">
                    <div className="text-brand-navy/60 mb-1 text-xs">Wind</div>
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
              <h3 className="mb-2 text-sm font-semibold text-brand-navy">Additional Info</h3>
              <p className="text-brand-navy/80 text-sm leading-relaxed">{beach.notes}</p>
            </div>
          )}

          {/* Gallery */}
          {beach.gallery && beach.gallery.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-brand-navy">Gallery</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {beach.gallery.map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg">
                    <Image 
                      src={image} 
                      alt={`${beach.name} - Image ${index + 1}`}
                      fill
                      unoptimized={process.env.NODE_ENV === 'development'}
                      className="object-cover transition-transform duration-200 hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      onError={(e) => {
                        console.error('Gallery image failed to load:', image, e);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={handleDirectionsClick}
              className="w-full rounded-lg bg-brand-blue px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-brand-navy"
            >
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};