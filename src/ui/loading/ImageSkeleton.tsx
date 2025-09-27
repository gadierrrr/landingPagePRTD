import React from 'react';

interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: 'square' | '16/9' | '4/3';
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ 
  className = '',
  aspectRatio = '16/9' 
}) => {
  const aspectClass = aspectRatio === 'square' ? 'aspect-square' :
                     aspectRatio === '4/3' ? 'aspect-[4/3]' :
                     'aspect-[16/9]';

  return (
    <div className={`${aspectClass} to-brand-sand/60 animate-pulse bg-gradient-to-br from-brand-sand ${className}`}>
      <div className="flex size-full items-center justify-center">
        <div className="text-brand-navy/30 text-4xl">🏖️</div>
      </div>
    </div>
  );
};