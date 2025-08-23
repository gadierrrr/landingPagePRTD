import React from 'react';
import { Deal } from '../../lib/forms';
import { DealCard } from './DealCard';

interface DealsGridProps {
  deals: Deal[];
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
}

export const DealsGrid: React.FC<DealsGridProps> = ({ deals, onEdit, onDelete }) => {
  if (deals.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-brand-navy/50 text-lg">No deals found</div>
        <p className="text-brand-navy/40 mt-2 text-sm">Create your first deal to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {deals.map(deal => (
        <DealCard
          key={deal.id}
          deal={deal}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};