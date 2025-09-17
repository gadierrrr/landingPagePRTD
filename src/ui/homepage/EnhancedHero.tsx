import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CategoryPills } from './CategoryPills';
import { WaveDivider } from './WaveDivider';

interface EnhancedHeroProps {
  backgrounds: string[];
  onCtaClick?: (cta: string) => void;
  onPillClick?: (category: string, position: number) => void;
}

const CATEGORY_PILLS = [
  { emoji: '🌴', label: 'Beaches', href: '/deals?category=activity', bgColor: 'bg-white/95', textColor: 'text-brand-navy' },
  { emoji: '🍽', label: 'Food', href: '/deals?category=restaurant', bgColor: 'bg-white/95', textColor: 'text-brand-navy' },
  { emoji: '🏨', label: 'Hotels', href: '/deals?category=hotel', bgColor: 'bg-brand-blue', textColor: 'text-white' },
  { emoji: '🌙', label: 'Nightlife', href: '/deals?category=activity', bgColor: 'bg-brand-blue', textColor: 'text-white' }
];

export const EnhancedHero: React.FC<EnhancedHeroProps> = ({ 
  backgrounds, 
  onCtaClick,
  onPillClick 
}) => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    if (backgrounds.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const currentBackground = backgrounds[currentBgIndex] || backgrounds[0];

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-brand-navy">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="size-full bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${currentBackground})`,
            filter: 'brightness(0.7)'
          }}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl text-center text-white">
          {/* Headline */}
          <h1 className="mb-8 text-5xl font-black leading-none sm:text-7xl lg:text-8xl">
            Puerto Rico<br />
            travel deals,<br />
            made fun.
          </h1>

          {/* Category Pills */}
          <div className="mb-10">
            <CategoryPills 
              categories={CATEGORY_PILLS}
              onPillClick={onPillClick}
            />
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/deals"
              onClick={() => onCtaClick?.('browse_deals')}
              className="hover:bg-brand-red/90 inline-flex items-center rounded-full bg-brand-red px-10 py-4 text-lg font-bold text-white shadow-xl transition-all duration-200 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Browse Deals
            </Link>
            
            <Link
              href="/travel-pass"
              onClick={() => onCtaClick?.('travel_pass')}
              className="hover:bg-brand-blue/90 inline-flex items-center rounded-full bg-brand-blue px-10 py-4 text-lg font-bold text-white shadow-xl transition-all duration-200 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Travel Pass
            </Link>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute inset-x-0 bottom-0">
        <WaveDivider />
      </div>
    </section>
  );
};