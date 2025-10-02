import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CategoryPills } from './CategoryPills';

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateMatch = (match: boolean) => setIsMobile(match);
    const handleChange = (event: MediaQueryListEvent) => updateMatch(event.matches);

    updateMatch(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }

    return undefined;
  }, []);

  const heroBackgrounds = useMemo(() => {
    if (!backgrounds || backgrounds.length === 0) {
      return backgrounds;
    }
    return isMobile ? backgrounds.slice(0, 1) : backgrounds;
  }, [backgrounds, isMobile]);

  useEffect(() => {
    setCurrentBgIndex(0);
  }, [isMobile]);

  useEffect(() => {
    if (!heroBackgrounds || heroBackgrounds.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [heroBackgrounds]);

  const currentBackground = heroBackgrounds[currentBgIndex] || backgrounds[0];

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-brand-navy">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={currentBackground}
          alt="Puerto Rico beach resorts and Caribbean vacation destinations - Culebra, San Juan, Vieques"
          fill
          priority
          quality={60}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 85vw, 1200px"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(0.7)'
          }}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl text-center text-white">
          {/* Headline */}
          <h1 className="mb-8 text-5xl font-black leading-none sm:text-7xl lg:text-8xl">
            Best Puerto Rico Travel Deals 2025 - Hotels, Tours &amp; Dining Discounts
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
              prefetch={false}
              onClick={() => onCtaClick?.('browse_deals')}
              className="hover:bg-brand-red/90 inline-flex items-center rounded-full bg-brand-red px-10 py-4 text-lg font-bold text-white shadow-xl transition-all duration-200 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Browse Deals
            </Link>
            
            <Link
              href="/beachfinder"
              prefetch={false}
              onClick={() => onCtaClick?.('beach_finder')}
              className="hover:bg-brand-blue/90 inline-flex items-center rounded-full bg-brand-blue px-10 py-4 text-lg font-bold text-white shadow-xl transition-all duration-200 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Beach Finder
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
};
