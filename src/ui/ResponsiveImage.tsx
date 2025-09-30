import Image from 'next/image';
import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  sizes?: string;
  quality?: number;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  objectFit = 'cover',
  objectPosition = '50% 40%',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  quality = 75
}) => {
  // Handle both absolute URLs and relative paths
  const isExternal = src.startsWith('http');
  const imageSrc = isExternal ? src : src;

  if (width && height) {
    // Fixed dimensions
    return (
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={className}
        style={{ objectFit, objectPosition }}
        quality={quality}
        sizes={sizes}
      />
    );
  }

  // Fill container (for aspect-ratio containers)
  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      priority={priority}
      className={className}
      style={{ objectFit, objectPosition }}
      quality={quality}
      sizes={sizes}
    />
  );
};