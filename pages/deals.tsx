import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';
import { Deal } from '../src/lib/forms';
import { PublicDealsGrid } from '../src/ui/deals/PublicDealsGrid';
import { generateCategoryMeta, generateDealListSchema, generateFAQPageSchema } from '../src/lib/seo';
import { useScrollTracking } from '../src/hooks/useScrollTracking';
import { useTimeTracking } from '../src/hooks/useTimeTracking';
import { trackCategoryView, trackFilter } from '../src/lib/analytics';

type SortOption = 'newest' | 'ending-soon';

// Feature flag for enhanced contrast
const DEALS_CONTRAST = true;

export default function Deals() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Analytics tracking hooks
  useScrollTracking('deals_page');
  useTimeTracking('deals_page');

  // Track category changes
  useEffect(() => {
    if (selectedCategory !== 'all') {
      const categoryDeals = deals.filter(deal => deal.category === selectedCategory);
      trackCategoryView(selectedCategory, categoryDeals.length);
    }
  }, [selectedCategory, deals]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    if (category !== 'all') {
      const categoryDeals = deals.filter(deal => deal.category === category);
      trackFilter('category', category, categoryDeals.length);
    }
  };

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    trackFilter('sort', newSortBy, filteredAndSortedDeals.length);
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Handle URL parameters for category filtering
  useEffect(() => {
    if (router.isReady && router.query.category) {
      const urlCategory = router.query.category as string;
      if (['hotel', 'restaurant', 'activity', 'tour'].includes(urlCategory)) {
        setSelectedCategory(urlCategory);
      }
    }
  }, [router.isReady, router.query.category]);

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

  // Generate dynamic meta based on selected category
  const currentMeta = useMemo(() => {
    if (selectedCategory === 'all') {
      return {
        title: "Puerto Rico Travel Deals - Hotels, Dining & Activities",
        description: "Discover the best travel deals in Puerto Rico. Island-wide discounts on hotels, dining, and experiences—curated by locals and updated daily.",
        keywords: ["Puerto Rico deals", "travel deals Puerto Rico", "Puerto Rico hotel deals", "Puerto Rico restaurant deals", "Puerto Rico activity deals", "Puerto Rico tour deals", "San Juan deals", "Caribbean vacation deals", "Puerto Rico discounts", "best deals Puerto Rico", "Puerto Rico travel packages", "cheap Puerto Rico hotels"]
      };
    }
    return generateCategoryMeta(selectedCategory);
  }, [selectedCategory]);

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

  // Generate structured data for SEO
  const dealListSchema = useMemo(() =>
    generateDealListSchema(filteredAndSortedDeals),
    [filteredAndSortedDeals]
  );

  const faqSchema = generateFAQPageSchema([
    {
      question: "How do I redeem a Puerto Rico travel deal?",
      answer: "Each deal includes specific redemption instructions. Click on any deal to view complete details, booking links, and promo codes. Most deals can be redeemed by visiting the partner's website directly or calling to book and mentioning the offer. Some deals require a promo code which will be clearly displayed."
    },
    {
      question: "Are these deals available to everyone?",
      answer: "Yes! All deals on Puerto Rico Travel Deals are available to the public. Whether you're a local resident or visiting the island, you can take advantage of these exclusive offers. Some deals may have specific terms or blackout dates, which will be noted in the deal details."
    },
    {
      question: "How often are new deals added?",
      answer: "We add new deals daily and update our listings regularly. Deals are sourced from verified local businesses across Puerto Rico. Sign up for our newsletter to receive notifications about the hottest new deals as soon as they're posted."
    },
    {
      question: "Can I save money on hotels in Puerto Rico?",
      answer: "Absolutely! We feature exclusive hotel deals across Puerto Rico, from beachfront resorts in Culebra and Vieques to boutique hotels in Old San Juan. Our hotel deals typically offer 30-60% off regular rates, including packages with added perks like free breakfast, spa credits, or room upgrades."
    },
    {
      question: "Do the deals expire?",
      answer: "Most deals have expiration dates which are clearly displayed on each offer. We regularly remove expired deals to keep our listings current. Use the 'Ending Soon' sort option to prioritize deals that are about to expire. Some ongoing promotions may not have specific end dates."
    }
  ]);

  if (DEALS_CONTRAST) {
    return (
      <>
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(dealListSchema, null, 2)
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqSchema, null, 2)
            }}
          />
        </Head>

        <SiteLayout>
          <SEO
            title={currentMeta.title}
            description={currentMeta.description}
            keywords={currentMeta.keywords}
            canonical="https://puertoricotraveldeals.com/deals"
          />
        <section className="bg-brand-navy text-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="ring-brand-navy/10 relative overflow-hidden rounded-3xl bg-white p-6 text-brand-navy ring-1 sm:p-10">
              <Heading level={1}>Best Puerto Rico Travel Deals - Hotels, Dining &amp; Activities</Heading>
              <p className="text-brand-navy/70 mt-4">Island-wide discounts on accommodations, restaurants, tours, and experiences—curated by locals and updated daily</p>

              {/* SEO Content Section */}
              <div className="prose prose-navy mx-auto mt-6 max-w-4xl">
                <p className="text-brand-navy/80 leading-relaxed">
                  Save up to 60% on your <strong>Puerto Rico vacation</strong> with exclusive deals on hotels, restaurants, activities, and tours.
                  From luxury <strong>beachfront resorts in Culebra</strong> and <strong>boutique hotels in Old San Juan</strong> to authentic
                  dining experiences and unforgettable adventures across the island, our curated deals help you experience the best of Puerto Rico
                  without breaking the bank.
                </p>
                <p className="text-brand-navy/80 leading-relaxed">
                  Whether you're planning a romantic getaway, family vacation, or solo adventure, discover verified deals from trusted local
                  businesses. New offers added daily covering <strong>San Juan</strong>, <strong>Rincón</strong>, <strong>Vieques</strong>,
                  <strong>Ponce</strong>, and destinations across all 78 municipalities. Filter by category to find exactly what you need—from
                  all-inclusive hotel packages to restaurant deals and guided tours.
                </p>
              </div>

              <div className="border-brand-navy/10 mt-6 border-t pt-6">
                
                {/* Toolbar */}
                {!loading && !error && deals.length > 0 && (
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCategoryChange('all')}
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
                          onClick={() => handleCategoryChange(category)}
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
                        onChange={(e) => handleSortChange(e.target.value as SortOption)}
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

              {/* FAQ Section */}
              <div className="border-brand-navy/10 mt-8 border-t pt-8">
                <Heading level={2} className="mb-6">
                  Frequently Asked Questions
                </Heading>
                <div className="space-y-4">
                  <details className="group rounded-lg bg-brand-sand p-4 shadow-sm">
                    <summary className="cursor-pointer text-base font-semibold text-brand-navy hover:text-brand-blue">
                      How do I redeem a Puerto Rico travel deal?
                    </summary>
                    <p className="text-brand-navy/80 mt-3 leading-relaxed text-sm">
                      Each deal includes specific redemption instructions. Click on any deal to view complete details, booking links, and promo codes.
                      Most deals can be redeemed by visiting the partner's website directly or calling to book and mentioning the offer. Some deals
                      require a promo code which will be clearly displayed.
                    </p>
                  </details>

                  <details className="group rounded-lg bg-brand-sand p-4 shadow-sm">
                    <summary className="cursor-pointer text-base font-semibold text-brand-navy hover:text-brand-blue">
                      Are these deals available to everyone?
                    </summary>
                    <p className="text-brand-navy/80 mt-3 leading-relaxed text-sm">
                      Yes! All deals on Puerto Rico Travel Deals are available to the public. Whether you're a local resident or visiting the island,
                      you can take advantage of these exclusive offers. Some deals may have specific terms or blackout dates, which will be noted in
                      the deal details.
                    </p>
                  </details>

                  <details className="group rounded-lg bg-brand-sand p-4 shadow-sm">
                    <summary className="cursor-pointer text-base font-semibold text-brand-navy hover:text-brand-blue">
                      How often are new deals added?
                    </summary>
                    <p className="text-brand-navy/80 mt-3 leading-relaxed text-sm">
                      We add new deals daily and update our listings regularly. Deals are sourced from verified local businesses across Puerto Rico.
                      Sign up for our newsletter to receive notifications about the hottest new deals as soon as they're posted.
                    </p>
                  </details>

                  <details className="group rounded-lg bg-brand-sand p-4 shadow-sm">
                    <summary className="cursor-pointer text-base font-semibold text-brand-navy hover:text-brand-blue">
                      Can I save money on hotels in Puerto Rico?
                    </summary>
                    <p className="text-brand-navy/80 mt-3 leading-relaxed text-sm">
                      Absolutely! We feature exclusive hotel deals across Puerto Rico, from beachfront resorts in Culebra and Vieques to boutique
                      hotels in Old San Juan. Our hotel deals typically offer 30-60% off regular rates, including packages with added perks like free
                      breakfast, spa credits, or room upgrades.
                    </p>
                  </details>

                  <details className="group rounded-lg bg-brand-sand p-4 shadow-sm">
                    <summary className="cursor-pointer text-base font-semibold text-brand-navy hover:text-brand-blue">
                      Do the deals expire?
                    </summary>
                    <p className="text-brand-navy/80 mt-3 leading-relaxed text-sm">
                      Most deals have expiration dates which are clearly displayed on each offer. We regularly remove expired deals to keep our
                      listings current. Use the 'Ending Soon' sort option to prioritize deals that are about to expire. Some ongoing promotions may
                      not have specific end dates.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="border-brand-navy/10 border-t"></div>
        </SiteLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(dealListSchema, null, 2)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema, null, 2)
          }}
        />
      </Head>

      <SiteLayout>
        <SEO
          title={currentMeta.title}
          description={currentMeta.description}
          keywords={currentMeta.keywords}
          canonical="https://puertoricotraveldeals.com/deals"
        />
      <Section>
        <Heading level={1}>Best Puerto Rico Travel Deals - Hotels, Dining &amp; Activities</Heading>
        <p className="text-brand-navy/70 mt-4">Island-wide discounts on accommodations, restaurants, tours, and experiences—curated by locals and updated daily</p>

        {/* SEO Content Section */}
        <div className="prose prose-navy mx-auto mt-6 max-w-4xl">
          <p className="text-brand-navy/80 leading-relaxed">
            Save up to 60% on your <strong>Puerto Rico vacation</strong> with exclusive deals on hotels, restaurants, activities, and tours.
            From luxury <strong>beachfront resorts in Culebra</strong> and <strong>boutique hotels in Old San Juan</strong> to authentic
            dining experiences and unforgettable adventures across the island, our curated deals help you experience the best of Puerto Rico
            without breaking the bank.
          </p>
          <p className="text-brand-navy/80 leading-relaxed">
            Whether you're planning a romantic getaway, family vacation, or solo adventure, discover verified deals from trusted local
            businesses. New offers added daily covering <strong>San Juan</strong>, <strong>Rincón</strong>, <strong>Vieques</strong>,
            <strong>Ponce</strong>, and destinations across all 78 municipalities. Filter by category to find exactly what you need—from
            all-inclusive hotel packages to restaurant deals and guided tours.
          </p>
        </div>

        {/* Toolbar */}
        {!loading && !error && deals.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
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
                  onClick={() => handleCategoryChange(category)}
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

        {/* FAQ Section */}
        <div className="border-brand-navy/10 mt-8 border-t pt-8">
          <Heading level={2} className="mb-6">
            Frequently Asked Questions
          </Heading>
          <div className="space-y-4">
            <details className="group rounded-lg bg-white p-4 shadow-sm">
              <summary className="cursor-pointer text-base font-semibold text-brand-navy hover:text-brand-blue">
                How do I redeem a Puerto Rico travel deal?
              </summary>
              <p className="text-brand-navy/80 mt-3 leading-relaxed text-sm">
                Each deal includes specific redemption instructions. Click on any deal to view complete details, booking links, and promo codes.
                Most deals can be redeemed by visiting the partner's website directly or calling to book and mentioning the offer. Some deals
                require a promo code which will be clearly displayed.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-4 shadow-sm">
              <summary className="cursor-pointer text-base font-semibold text-brand-navy hover:text-brand-blue">
                Are these deals available to everyone?
              </summary>
              <p className="text-brand-navy/80 mt-3 leading-relaxed text-sm">
                Yes! All deals on Puerto Rico Travel Deals are available to the public. Whether you're a local resident or visiting the island,
                you can take advantage of these exclusive offers. Some deals may have specific terms or blackout dates, which will be noted in
                the deal details.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-4 shadow-sm">
              <summary className="cursor-pointer text-base font-semibold text-brand-navy hover:text-brand-blue">
                How often are new deals added?
              </summary>
              <p className="text-brand-navy/80 mt-3 leading-relaxed text-sm">
                We add new deals daily and update our listings regularly. Deals are sourced from verified local businesses across Puerto Rico.
                Sign up for our newsletter to receive notifications about the hottest new deals as soon as they're posted.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-4 shadow-sm">
              <summary className="cursor-pointer text-base font-semibold text-brand-navy hover:text-brand-blue">
                Can I save money on hotels in Puerto Rico?
              </summary>
              <p className="text-brand-navy/80 mt-3 leading-relaxed text-sm">
                Absolutely! We feature exclusive hotel deals across Puerto Rico, from beachfront resorts in Culebra and Vieques to boutique
                hotels in Old San Juan. Our hotel deals typically offer 30-60% off regular rates, including packages with added perks like free
                breakfast, spa credits, or room upgrades.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-4 shadow-sm">
              <summary className="cursor-pointer text-base font-semibold text-brand-navy hover:text-brand-blue">
                Do the deals expire?
              </summary>
              <p className="text-brand-navy/80 mt-3 leading-relaxed text-sm">
                Most deals have expiration dates which are clearly displayed on each offer. We regularly remove expired deals to keep our
                listings current. Use the 'Ending Soon' sort option to prioritize deals that are about to expire. Some ongoing promotions may
                not have specific end dates.
              </p>
            </details>
          </div>
        </div>
      </Section>
      </SiteLayout>
    </>
  );
}