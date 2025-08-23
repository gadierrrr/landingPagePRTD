import React from 'react';
import { Deal } from '../../lib/forms';
import { Button } from '../Button';

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, onEdit, onDelete }) => {
  const isExpired = deal.expiry && new Date(deal.expiry) < new Date();
  
  return (
    <div className="ring-brand-navy/10 space-y-3 rounded-xl bg-white p-4 ring-1">
      <div className="aspect-video overflow-hidden rounded-lg bg-brand-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={deal.image} 
          alt={deal.title}
          className="size-full object-cover"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="line-clamp-2 text-lg font-bold text-brand-navy">{deal.title}</h3>
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
            deal.category === 'restaurant' ? 'bg-brand-red/10 text-brand-red' :
            deal.category === 'hotel' ? 'bg-brand-blue/10 text-brand-blue' :
            deal.category === 'tour' ? 'bg-brand-navy/10 text-brand-navy' :
            'bg-brand-sand/50 text-brand-navy'
          }`}>
            {deal.category}
          </span>
        </div>
        
        <p className="text-brand-navy/70 line-clamp-3 text-sm">{deal.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-navy/60">{deal.location}</span>
          <span className="font-bold text-brand-navy">{deal.amountLabel}</span>
        </div>
        
        {deal.partner && (
          <p className="text-brand-navy/50 text-xs">Source: {deal.partner}</p>
        )}
        
        {deal.expiry && (
          <p className={`text-xs ${isExpired ? 'text-brand-red' : 'text-brand-navy/50'}`}>
            Expires: {new Date(deal.expiry).toLocaleDateString()}
          </p>
        )}
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(deal)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => onDelete(deal.id!)}
          className="flex-1"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};