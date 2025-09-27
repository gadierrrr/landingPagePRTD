import React from 'react';
import Link from 'next/link';
import { Beach } from '../../lib/forms';
import { PublicBeachCard } from './PublicBeachCard';

interface RelatedBeachesGridProps {
  beaches: Beach[];
  currentBeach: Beach;
  title?: string;
}

export const RelatedBeachesGrid: React.FC<RelatedBeachesGridProps> = ({ 
  beaches, 
  currentBeach, 
  title = "More Beaches in This Area" 
}) => {
  // Filter out current beach and limit to 6
  const relatedBeaches = beaches
    .filter(beach => beach.id !== currentBeach.id)
    .slice(0, 6);

  if (relatedBeaches.length === 0) {
    return null;
  }

  return (
    <div className="border-brand-navy/10 border-t pt-8">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-brand-navy">
          {title}
        </h2>
        <p className="text-brand-navy/60">
          Discover other beautiful beaches in {currentBeach.municipality}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedBeaches.map(beach => (
          <PublicBeachCard 
            key={beach.id} 
            beach={beach}
            // No distance calculation needed for related beaches
            onDetailsClick={() => {
              // Let the card handle navigation
            }}
            onDirectionsClick={() => {
              // Analytics will be handled by the card
            }}
          />
        ))}
      </div>
      
      {beaches.length > 6 && (
        <div className="mt-6 text-center">
          <Link
            href="/beachfinder"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy"
          >
            See All Beaches ({beaches.length - 1} more)
          </Link>
        </div>
      )}
    </div>
  );
};