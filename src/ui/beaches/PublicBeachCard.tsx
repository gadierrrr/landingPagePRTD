import React, { lazy, Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Beach } from '../../lib/forms';
import { TAG_LABELS, AMENITY_LABELS, CONDITION_LABELS } from '../../constants/beachVocab';
import { useShare } from '../../hooks/useShare';
import { ImageSkeleton } from '../loading/ImageSkeleton';
import { 
  trackBeachShareOpen, 
  trackBeachSharePlatform, 
  trackBeachShareCopy, 
  trackBeachShareSuccess, 
  trackBeachShareError 
} from '../../lib/analytics';

// Dynamically import the share modal to avoid bundle bloat
const BeachShareModal = lazy(() => 
  import('./BeachShareModal').then(module => ({ default: module.BeachShareModal }))
);

interface PublicBeachCardProps {
  beach: Beach;
  distance?: number; // in meters
  priority?: boolean; // For image loading priority
  onDirectionsClick?: () => void;
  onDetailsClick?: () => void;
  onShareClick?: () => void;
}

export const PublicBeachCard: React.FC<PublicBeachCardProps> = ({ 
  beach, 
  distance,
  priority = false,
  onDirectionsClick,
  onDetailsClick,
  onShareClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();
  
  // Initialize share hook with analytics callbacks
  const shareHook = useShare({
    onShareOpen: (beach, support) => {
      trackBeachShareOpen(beach, 'card', support);
    },
    onShareSuccess: (beach, platform) => {
      trackBeachShareSuccess(beach, platform);
    },
    onShareError: (beach, error) => {
      trackBeachShareError(beach, error);
    },
    onPlatformClick: (beach, platform) => {
      trackBeachSharePlatform(beach, platform);
    },
    onCopyLink: (beach) => {
      trackBeachShareCopy(beach);
    }
  });
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
    
    // Navigate to beach detail page using Next.js router
    if (beach.slug) {
      router.push(`/beaches/${beach.slug}`).catch((error) => {
        console.error('Navigation failed:', error);
        // Fallback to window.location if router fails
        window.location.href = `/beaches/${beach.slug}`;
      });
    }
    
    if (onDetailsClick) {
      onDetailsClick();
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!beach.slug) return;
    
    const beachUrl = `${window.location.origin}/beaches/${beach.slug}`;
    await shareHook.shareBeach(beach, beachUrl);
    
    if (onShareClick) {
      onShareClick();
    }
  };

  return (
    <div className="ring-brand-navy/10 hover:ring-brand-blue/20 group relative cursor-pointer overflow-hidden rounded-xl bg-white ring-1 transition-all duration-200 hover:shadow-md">
      {/* 16:9 Aspect Ratio Image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#0A2A29]">
        {!imageLoaded && (
          <div className="absolute inset-0 z-10">
            <ImageSkeleton className="rounded-xl" />
          </div>
        )}
        <Image
          src={beach.coverImage}
          alt={`${beach.name} beach in ${beach.municipality}, Puerto Rico - ${beach.tags?.slice(0, 2).map(t => TAG_LABELS[t] || t).join(', ') || 'scenic view'}`}
          fill
          priority={priority}
          // Disable optimization in development or if image loading fails on mobile
          unoptimized={process.env.NODE_ENV === 'development'}
          className={`object-cover object-center transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 400px"
          onLoad={() => {
            setImageLoaded(true);
          }}
          onError={(e) => {
            console.error('Beach image failed to load:', beach.coverImage, e);
            setImageLoaded(true); // Still show the card content
          }}
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
              <span className="text-brand-navy/60 inline-flex rounded-full bg-brand-sand px-2 py-1 text-xs font-medium">
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
            className="flex-1 rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy"
            aria-label={`Get directions to ${beach.name}`}
          >
            Directions
          </button>
          <button
            onClick={handleDetailsClick}
            className="bg-brand-navy/10 flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-blue hover:text-white"
            aria-label={`View details for ${beach.name}`}
          >
            Details
          </button>
          <button
            onClick={handleShareClick}
            disabled={shareHook.isSharing}
            className="flex-1 rounded-lg bg-brand-sand px-3 py-2 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white disabled:opacity-50"
            aria-label={`Share ${beach.name}`}
          >
            {shareHook.isSharing ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
      
      {/* Share Modal */}
      <Suspense fallback={null}>
        <BeachShareModal
          beach={shareHook.currentBeach}
          isOpen={shareHook.isModalOpen}
          onClose={shareHook.closeModal}
          beachUrl={shareHook.currentBeachUrl}
          onPlatformClick={shareHook.handlePlatformClick}
          onCopyClick={shareHook.handleCopyClick}
        />
      </Suspense>
    </div>
  );
};