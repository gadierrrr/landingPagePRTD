import React from 'react';
import Link from 'next/link';
import { Deal } from '../../lib/forms';
import { PublicDealCard } from './PublicDealCard';

interface PublicDealsGridProps {
  deals: Deal[];
}

export const PublicDealsGrid: React.FC<PublicDealsGridProps> = ({ deals }) => {
  if (deals.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="ring-brand-navy/10 mx-auto max-w-md rounded-xl bg-brand-sand p-8 ring-1">
          <div className="text-lg font-semibold text-brand-navy">No deals available</div>
          <p className="text-brand-navy/70 mt-2 text-sm">Check back soon for new travel deals</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link 
              href="/"
              className="hover:bg-brand-blue/90 rounded-full bg-brand-blue px-5 py-3 font-bold text-white shadow"
            >
              Back to Home
            </Link>
            <a 
              href="https://www.instagram.com/puertoricotraveldeals" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-brand-navy/10 ring-brand-navy/20 hover:bg-brand-navy/20 rounded-full px-5 py-3 font-bold text-brand-navy ring-1"
            >
              Follow @PRTD
            </a>
          </div>
        </div>
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