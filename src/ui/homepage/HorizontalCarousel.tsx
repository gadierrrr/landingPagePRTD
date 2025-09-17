import React, { useRef } from 'react';
import { Deal } from '../../lib/forms';
import { PublicDealCard } from '../deals/PublicDealCard';

interface HorizontalCarouselProps {
  deals: Deal[];
  title: string;
  subtitle: string;
  onDealClick?: (dealId: string, position: number) => void;
  onScroll?: (direction: 'left' | 'right') => void;
}

export const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({
  deals,
  title,
  subtitle,
  onDealClick,
  onScroll
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
      onScroll?.('left');
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      onScroll?.('right');
    }
  };

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header with scroll controls */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black text-brand-navy sm:text-4xl">{title}</h2>
            <p className="text-brand-navy/70 mt-3 sm:text-lg">{subtitle}</p>
          </div>
          
          {/* Desktop scroll controls */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={scrollLeft}
              className="bg-brand-navy/10 flex size-10 items-center justify-center rounded-full text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              onClick={scrollRight}
              className="bg-brand-navy/10 flex size-10 items-center justify-center rounded-full text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="carousel-container flex gap-4 overflow-x-auto scroll-smooth pb-4"
          role="region"
          aria-label={`${title} carousel`}
          style={{ 
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {deals.map((deal, index) => (
            <div 
              key={deal.id}
              className="carousel-item w-80 shrink-0"
              style={{ scrollSnapAlign: 'start' }}
              onClick={() => onDealClick?.(deal.id || '', index)}
            >
              <PublicDealCard deal={deal} />
            </div>
          ))}
        </div>

        {/* Mobile scroll indicator */}
        <div className="text-brand-navy/50 mt-4 text-center text-sm sm:hidden">
          Swipe to see more →
        </div>
      </div>
    </section>
  );
};