import React from 'react';
import Link from 'next/link';
import { Deal } from '../../lib/forms';
import { isExpired, displaySourceName, formatRelativeTime, formatEndDate } from '../../lib/dealUtils';

interface PublicDealCardProps {
  deal: Deal;
}

export const PublicDealCard: React.FC<PublicDealCardProps> = ({ deal }) => {
  const expired = isExpired(deal.expiresAt || deal.expiry);
  const sourceName = displaySourceName(deal.externalUrl, deal.sourceName);
  
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
      <div className="ring-brand-navy/10 hover:ring-brand-blue/20 relative cursor-pointer overflow-hidden rounded-xl bg-white ring-1 transition-all duration-200 hover:shadow-md" aria-label={`View details for ${deal.title}`}>
        {/* 16:9 Aspect Ratio Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-brand-sand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={deal.image} 
            alt={deal.title}
            className="size-full object-cover"
          />
          
          {/* Expired Badge */}
          {expired && (
            <div className="absolute right-3 top-3 rounded-full bg-brand-red px-2 py-1 text-xs font-bold text-white shadow-lg">
              Expired
            </div>
          )}
          
          {/* Source Badge */}
          {sourceName && (
            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
              From: {sourceName}
            </div>
          )}
        </div>
        
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 flex-1 text-lg font-bold leading-tight text-brand-navy transition-colors group-hover:text-brand-blue">
              {deal.title.length > 60 ? `${deal.title.slice(0, 60)}...` : deal.title}
            </h3>
            <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-bold capitalize ${
              deal.category === 'restaurant' ? 'bg-brand-red/10 text-brand-red' :
              deal.category === 'hotel' ? 'bg-brand-blue/10 text-brand-blue' :
              deal.category === 'tour' ? 'bg-brand-navy/10 text-brand-navy' :
              deal.category === 'activity' ? 'bg-brand-sand text-brand-navy' :
              'bg-brand-sand text-brand-navy'
            }`}>
              {deal.category}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-navy/60">{deal.location}</span>
            <span className="font-bold text-brand-navy">{deal.amountLabel}</span>
          </div>
          
          {/* Mini Meta */}
          <div className="text-brand-navy/50 flex items-center justify-between text-xs">
            <div>
              {(deal.expiresAt || deal.expiry) && (
                <span className={expired ? 'font-bold text-brand-red' : ''}>
                  {expired ? 'Expired' : `Ends ${formatEndDate(deal.expiresAt || deal.expiry!)}`}
                </span>
              )}
            </div>
            {deal.updatedAt && (
              <div>
                Updated {formatRelativeTime(deal.updatedAt)}
              </div>
            )}
          </div>
          
          {/* CTA Button */}
          <div className="pt-2">
            <div className="bg-brand-navy/10 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy transition-colors group-hover:bg-brand-blue group-hover:text-white">
              View Deal <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};