import React from 'react';
import { ImageSkeleton } from './ImageSkeleton';

export const BeachCardSkeleton: React.FC = () => {
  return (
    <div className="ring-brand-navy/10 overflow-hidden rounded-xl bg-white ring-1">
      {/* Image skeleton */}
      <ImageSkeleton className="rounded-xl" />
      
      <div className="space-y-3 p-4">
        {/* Title skeleton */}
        <div className="bg-brand-sand/60 h-6 animate-pulse rounded" />
        
        {/* Tags skeleton */}
        <div className="flex gap-1">
          <div className="bg-brand-sand/40 h-6 w-16 animate-pulse rounded-full" />
          <div className="bg-brand-sand/40 h-6 w-20 animate-pulse rounded-full" />
          <div className="bg-brand-sand/40 h-6 w-14 animate-pulse rounded-full" />
        </div>
        
        {/* Conditions skeleton */}
        <div className="flex gap-1">
          <div className="bg-brand-sand/40 h-5 w-12 animate-pulse rounded-full" />
          <div className="bg-brand-sand/40 h-5 w-16 animate-pulse rounded-full" />
        </div>
        
        {/* Amenities skeleton */}
        <div className="bg-brand-sand/40 h-4 w-3/4 animate-pulse rounded" />
        
        {/* Buttons skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="bg-brand-sand/60 h-9 flex-1 animate-pulse rounded-lg" />
          <div className="bg-brand-sand/40 h-9 flex-1 animate-pulse rounded-lg" />
          <div className="bg-brand-sand/40 h-9 flex-1 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
};