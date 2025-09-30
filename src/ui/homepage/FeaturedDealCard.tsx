import React, { useEffect } from 'react';
import Link from 'next/link';
import { Deal } from '../../lib/forms';
import { isExpired, displaySourceName, formatRelativeTime, formatEndDate } from '../../lib/dealUtils';
import { DealBadge, BadgeType } from './DealBadge';
import { trackDealClick, trackDealView } from '../../lib/analytics';
import { ResponsiveImage } from '../ResponsiveImage';

interface FeaturedDealCardProps {
  deal: Deal;
  badges?: BadgeType[];
  onDealClick?: (dealId: string) => void;
  position?: number;
  trackImpression?: boolean;
}

export const FeaturedDealCard: React.FC<FeaturedDealCardProps> = ({ 
  deal, 
  badges = [],
  onDealClick,
  position,
  trackImpression = true
}) => {
  const expired = isExpired(deal.expiresAt || deal.expiry);
  const sourceName = displaySourceName(deal.externalUrl, deal.sourceName);

  // Track impression when component mounts
  useEffect(() => {
    if (trackImpression) {
      trackDealView(deal, 'featured_deal_impression');
    }
  }, [deal, trackImpression]);

  const handleDealClick = () => {
    trackDealClick(deal, position, 'featured_deals');
    onDealClick?.(deal.id || '');
  };
  
  if (!deal.slug) {
    return null;
  }
  
  return (
    <Link 
      href={`/deal/${deal.slug}`} 
      prefetch={false}
      className="group block"
      onClick={handleDealClick}
    >
      <div className="ring-brand-navy/10 hover:ring-brand-blue/20 relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 transition-all duration-200 hover:shadow-xl">
        <div className="grid gap-0 md:grid-cols-2">
          {/* Image Side */}
          <div className="bg-brand-navy/5 relative aspect-[4/3] overflow-hidden md:aspect-auto">
            <ResponsiveImage
              src={deal.image}
              alt={`${deal.title} in ${deal.location}, Puerto Rico - ${deal.category} deal`}
              priority
              objectPosition={deal.objectPosition || '50% 40%'}
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={75}
              className="transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Badges */}
            {badges.length > 0 && (
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {badges.map((badge, index) => (
                  <DealBadge key={index} type={badge} />
                ))}
              </div>
            )}
            
            {/* Expired Badge */}
            {expired && (
              <div className="absolute right-4 top-4 rounded-full bg-brand-red px-3 py-1 text-sm font-bold text-white shadow-lg">
                Expired
              </div>
            )}
            
            {/* Source Badge */}
            {sourceName && (
              <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white">
                From: {sourceName}
              </div>
            )}
          </div>
          
          {/* Content Side */}
          <div className="flex flex-col justify-center p-6 md:p-8">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-sm font-bold capitalize ${
                  deal.category === 'restaurant' ? 'bg-brand-red/10 text-brand-red' :
                  deal.category === 'hotel' ? 'bg-brand-blue/10 text-brand-blue' :
                  deal.category === 'tour' ? 'bg-brand-navy/10 text-brand-navy' :
                  deal.category === 'activity' ? 'bg-brand-sand text-brand-navy' :
                  'bg-brand-sand text-brand-navy'
                }`}>
                  {deal.category}
                </span>
              </div>
            </div>
            
            <h3 className="mb-4 text-2xl font-black leading-tight text-brand-navy transition-colors group-hover:text-brand-blue sm:text-3xl">
              {deal.title}
            </h3>
            
            <p className="text-brand-navy/70 mb-4 line-clamp-2">
              {deal.description}
            </p>
            
            <div className="mb-4 flex items-center justify-between">
              <span className="text-brand-navy/60">{deal.location}</span>
              <span className="text-xl font-bold text-brand-navy">{deal.amountLabel}</span>
            </div>
            
            {/* Meta info */}
            <div className="text-brand-navy/50 flex items-center justify-between text-sm" suppressHydrationWarning>
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
            
            {/* CTA */}
            <div className="mt-6">
              <div className="inline-flex items-center gap-3 rounded-xl bg-brand-navy px-6 py-3 text-lg font-bold text-white transition-all duration-200 group-hover:bg-brand-blue">
                View Deal
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
