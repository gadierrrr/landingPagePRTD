import React from 'react';
import Link from 'next/link';
import { Deal } from '../../lib/forms';

interface PublicDealCardProps {
  deal: Deal;
}

export const PublicDealCard: React.FC<PublicDealCardProps> = ({ deal }) => {
  const isExpired = deal.expiry && new Date(deal.expiry) < new Date();
  const isExpiredAt = deal.expiresAt && new Date(deal.expiresAt) < new Date();
  const actuallyExpired = isExpired || isExpiredAt;
  
  if (!deal.slug) {
    // Fallback for deals without slugs (shouldn't happen after migration)
    return (
      <div className="ring-brand-navy/10 space-y-3 rounded-xl bg-white p-4 opacity-50 ring-1">
        <div className="text-brand-navy/50 text-sm">Deal configuration incomplete</div>
      </div>
    );
  }
  
  return (
    <Link href={`/deal/${deal.slug}`} className="group block">
      <div className="ring-brand-navy/10 hover:ring-brand-blue/20 cursor-pointer space-y-3 rounded-xl bg-white p-4 ring-1 transition-all duration-200 hover:shadow-md" aria-label={`View details for ${deal.title}`}>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-brand-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={deal.image} 
          alt={deal.title}
          className="size-full object-cover"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="line-clamp-2 text-lg font-bold text-brand-navy transition-colors group-hover:text-brand-blue">{deal.title}</h3>
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
        
        {(deal.expiry || deal.expiresAt) && (
          <p className={`text-xs ${actuallyExpired ? 'font-bold text-brand-red' : 'text-brand-navy/50'}`}>
            {actuallyExpired ? 'Expired' : 'Expires:'} {new Date(deal.expiresAt || deal.expiry!).toLocaleDateString()}
          </p>
        )}
        
        {actuallyExpired && (
          <div className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
            Expired
          </div>
        )}
      </div>
      </div>
    </Link>
  );
};