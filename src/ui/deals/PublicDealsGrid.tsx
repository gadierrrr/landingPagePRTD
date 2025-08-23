import React from 'react';
import { Deal } from '../../lib/forms';
import { PublicDealCard } from './PublicDealCard';

interface PublicDealsGridProps {
  deals: Deal[];
}

export const PublicDealsGrid: React.FC<PublicDealsGridProps> = ({ deals }) => {
  if (deals.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-brand-navy/50 text-lg">No deals available</div>
        <p className="text-brand-navy/40 mt-2 text-sm">Check back soon for new travel deals</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {deals.map(deal => (
        <PublicDealCard
          key={deal.id}
          deal={deal}
        />
      ))}
    </div>
  );
};