import React, { useState, useEffect, useMemo } from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';
import { Deal } from '../src/lib/forms';
import { PublicDealsGrid } from '../src/ui/deals/PublicDealsGrid';

type SortOption = 'newest' | 'ending-soon';

// Feature flag for enhanced contrast
const DEALS_CONTRAST = true;

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals');
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      setError('Failed to load deals');
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from deals data
  const categories = useMemo(() => {
    const dealCategories = deals.map(deal => deal.category);
    return Array.from(new Set(dealCategories));
  }, [deals]);

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }
    
    // Sort deals
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        // Sort by updatedAt desc, then by slug asc for stable order
        const aUpdated = a.updatedAt || '1970-01-01';
        const bUpdated = b.updatedAt || '1970-01-01';
        if (aUpdated !== bUpdated) {
          return new Date(bUpdated).getTime() - new Date(aUpdated).getTime();
        }
        return (a.slug || a.id || '').localeCompare(b.slug || b.id || '');
      } else { // ending-soon
        // Sort by expiresAt asc, with deals without expiry at the end
        const aExpires = a.expiresAt || a.expiry;
        const bExpires = b.expiresAt || b.expiry;
        
        if (!aExpires && !bExpires) return 0;
        if (!aExpires) return 1;
        if (!bExpires) return -1;
        
        return new Date(aExpires).getTime() - new Date(bExpires).getTime();
      }
    });
    
    return sorted;
  }, [deals, selectedCategory, sortBy]);

  if (DEALS_CONTRAST) {
    return (
      <SiteLayout>
        <SEO 
          title="Puerto Rico Travel Deals - Hotels, Dining & Activities"
          description="Discover the best travel deals in Puerto Rico. Island-wide discounts on hotels, dining, and experiences—curated by locals and updated daily."
        />
        <section className="bg-brand-navy text-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="ring-brand-navy/10 relative overflow-hidden rounded-3xl bg-white p-6 text-brand-navy ring-1 sm:p-10">
              <Heading level={1}>Deals</Heading>
              <p className="text-brand-navy/70 mt-4">Discover the best travel deals in Puerto Rico</p>
              <div className="border-brand-navy/10 mt-6 border-t pt-6">
                
                {/* Toolbar */}
                {!loading && !error && deals.length > 0 && (
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                          selectedCategory === 'all'
                            ? 'bg-brand-navy text-white'
                            : 'hover:bg-brand-navy/10 ring-brand-navy/20 bg-brand-sand text-brand-navy ring-1'
                        }`}
                      >
                        All
                      </button>
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                            selectedCategory === category
                              ? 'bg-brand-navy text-white'
                              : 'hover:bg-brand-navy/10 ring-brand-navy/20 bg-brand-sand text-brand-navy ring-1'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-3">
                      <label htmlFor="sort" className="text-brand-navy/70 text-sm font-semibold">
                        Sort by:
                      </label>
                      <select
                        id="sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="border-brand-navy/20 focus:ring-brand-blue/20 rounded-lg border bg-white px-3 py-2 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
                      >
                        <option value="newest">Newest</option>
                        <option value="ending-soon">Ending Soon</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Content Area */}
                <div>
                  {loading && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-video rounded-lg bg-brand-sand"></div>
                          <div className="mt-3 space-y-2">
                            <div className="h-5 rounded bg-brand-sand"></div>
                            <div className="h-4 rounded bg-brand-sand"></div>
                            <div className="h-4 w-2/3 rounded bg-brand-sand"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-brand-red/10 border-brand-red/20 rounded-lg border px-4 py-3 text-brand-red">
                      {error}
                    </div>
                  )}
                  
                  {!loading && !error && (
                    <PublicDealsGrid deals={filteredAndSortedDeals} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="border-brand-navy/10 border-t"></div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <SEO 
        title="Puerto Rico Travel Deals - Hotels, Dining & Activities"
        description="Discover the best travel deals in Puerto Rico. Island-wide discounts on hotels, dining, and experiences—curated by locals and updated daily."
      />
      <Section>
        <Heading level={1}>Deals</Heading>
        <p className="text-brand-navy/70 mt-4">Discover the best travel deals in Puerto Rico</p>
        
        {/* Toolbar */}
        {!loading && !error && deals.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-brand-navy text-white'
                    : 'hover:bg-brand-navy/10 bg-brand-sand text-brand-navy'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                    selectedCategory === category
                      ? 'bg-brand-navy text-white'
                      : 'hover:bg-brand-navy/10 bg-brand-sand text-brand-navy'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-brand-navy/70 text-sm font-semibold">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border-brand-navy/20 focus:ring-brand-blue/20 rounded-lg border bg-white px-3 py-2 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2"
              >
                <option value="newest">Newest</option>
                <option value="ending-soon">Ending Soon</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          {loading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video rounded-lg bg-brand-sand"></div>
                  <div className="mt-3 space-y-2">
                    <div className="h-5 rounded bg-brand-sand"></div>
                    <div className="h-4 rounded bg-brand-sand"></div>
                    <div className="h-4 w-2/3 rounded bg-brand-sand"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {error && (
            <div className="bg-brand-red/10 border-brand-red/20 rounded-lg border px-4 py-3 text-brand-red">
              {error}
            </div>
          )}
          
          {!loading && !error && (
            <PublicDealsGrid deals={filteredAndSortedDeals} />
          )}
        </div>
      </Section>
    </SiteLayout>
  );
}