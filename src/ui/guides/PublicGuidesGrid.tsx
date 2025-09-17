import React from 'react';
import { GuideMeta } from '../../lib/guides';
import { PublicGuideCard } from './PublicGuideCard';

interface PublicGuidesGridProps {
  guides: GuideMeta[];
}

export const PublicGuidesGrid: React.FC<PublicGuidesGridProps> = ({ guides }) => {
  if (guides.length === 0) {
    return (
      <div className="text-brand-navy/60 py-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="mb-2 text-lg font-semibold text-brand-navy">No guides found</h3>
          <p className="text-sm">Check back soon for new travel guides and itineraries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <PublicGuideCard key={guide.slug} guide={guide} />
      ))}
    </div>
  );
};