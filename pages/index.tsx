import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { GetStaticProps } from "next";
import { LandingHeader } from "@/ui/landing/LandingHeader";
import { Footer } from "@/ui/Footer";
import { PublicDealCard } from "@/ui/deals/PublicDealCard";
import { generateOrganizationSchema, generateFAQPageSchema } from "@/lib/seo";
import { Deal } from "@/lib/forms";
import { useScrollTracking } from "@/hooks/useScrollTracking";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { trackDealImpression } from "@/lib/analytics";

interface Guide {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags?: string[];
  publishDate?: string;
}
import { EnhancedHero } from "@/ui/homepage/EnhancedHero";
import { SectionHeader } from "@/ui/homepage/SectionHeader";
import { FeaturedDealCard } from "@/ui/homepage/FeaturedDealCard";
import { HorizontalCarousel } from "@/ui/homepage/HorizontalCarousel";
import { GuideRow } from "@/ui/homepage/GuideRow";
import { WaveDivider } from "@/ui/homepage/WaveDivider";
import { getFeatureFlag } from "@/lib/featureFlags";
// Inline helper functions to avoid server-side imports
const getHeroBackgrounds = (): string[] => {
  return [
    '/images/uploads/2025/08/copamarina-beach-resort-1756152657533.jpg', // Beach
    '/images/uploads/2025/09/FairmontHotel-1757084065163.jpg', // Hotel/Rainforest
    '/images/uploads/2025/08/galleryinn-osj-1756166538791.jpg' // Old San Juan
  ];
};

const getDealBadges = (deal: Deal): ('hot' | 'editor')[] => {
  const badges: ('hot' | 'editor')[] = [];
  
  // Mark recent deals as "hot"
  if (deal.updatedAt) {
    const daysSinceUpdate = (Date.now() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate <= 3) {
      badges.push('hot');
    }
  }
  
  // Mark deals with high discounts as "editor's pick"
  if (deal.amountLabel.includes('%')) {
    const percentMatch = deal.amountLabel.match(/(\d+)%/);
    if (percentMatch) {
      const percent = parseInt(percentMatch[1]);
      if (percent >= 40) {
        badges.push('editor');
      }
    }
  }
  
  return badges;
};

// Puerto Rico Flag palette - see src/styles/tokens.css for hex values
// Whites and tints for contrast; large type + bold CTAs inspired by provided screenshots.

interface LandingProps {
  featuredDeal: Deal | null;
  latestDeals: Deal[];
  under50Deals: Deal[];
  guides: Guide[];
  heroBackgrounds: string[];
}

export default function PRTDPRFlagLanding({ 
  featuredDeal,
  latestDeals = [],
  under50Deals = [],
  guides = [],
  heroBackgrounds = []
}: LandingProps) {
  const [midFormStatus, setMidFormStatus] = useState<string>("");
  const [midFormLoading, setMidFormLoading] = useState(false);
  
  // Enhanced analytics tracking
  useScrollTracking('landing_page');
  useTimeTracking('landing_page');
  
  // Track deal impressions when deals load
  useEffect(() => {
    if (featuredDeal) {
      trackDealImpression([featuredDeal], 'homepage_featured_deal', 'landing_page');
    }
    if (latestDeals.length > 0) {
      trackDealImpression(latestDeals.slice(0, 8), 'homepage_latest_deals', 'landing_page');
    }
    if (under50Deals.length > 0) {
      trackDealImpression(under50Deals.slice(0, 8), 'homepage_under_50', 'landing_page');
    }
  }, [featuredDeal, latestDeals, under50Deals]);
  
  // Generate organization structured data
  const organizationSchema = generateOrganizationSchema();

  // Generate FAQ schema
  const faqSchema = generateFAQPageSchema([
    {
      question: "What is Puerto Rico Travel Deals (PRTD)?",
      answer: "Puerto Rico Travel Deals is your trusted source for exclusive vacation deals across Puerto Rico. We curate daily offers from verified local businesses including hotels, restaurants, tours, and activities in San Juan, Culebra, Vieques, Rincón, and all 78 municipalities. All deals are handpicked by locals to ensure authentic experiences at the best prices."
    },
    {
      question: "How do I redeem a travel deal on PRTD?",
      answer: "Redeeming deals is simple! Browse our deals, click on any offer to view full details including booking links and promo codes. Most deals can be redeemed by visiting the partner's website directly, calling to book and mentioning the offer, or using the provided promo code at checkout. Each deal includes specific redemption instructions."
    },
    {
      question: "Are the deals available to both tourists and locals?",
      answer: "Yes! All Puerto Rico Travel Deals are available to everyone - whether you're a local resident, visiting tourist, or planning your first trip to the island. We feature deals across all categories including hotels, dining, activities, and tours that work for both visitors and island residents."
    },
    {
      question: "How often are new deals added to PRTD?",
      answer: "We add new travel deals daily! Our team works directly with Puerto Rico businesses to bring you fresh offers every day. Deals are updated regularly, and we remove expired offers to keep listings current. Sign up for our newsletter to get notifications about the hottest new deals as soon as they're posted."
    },
    {
      question: "Can I find deals for specific Puerto Rico locations like Culebra or San Juan?",
      answer: "Absolutely! Our deals cover all of Puerto Rico's major destinations including San Juan (Old San Juan, Condado, Isla Verde), Culebra, Vieques, Rincón, Ponce, Fajardo, and more. Use our category filters and location search to find deals specific to your destination. We also have a Beach Finder tool to discover the best beaches across the island."
    }
  ]);

  // Analytics tracking functions
  const trackEvent = (eventName: string, data: Record<string, unknown>) => {
    if (typeof window !== "undefined" && (window as { dataLayer?: unknown[] }).dataLayer) {
      ((window as unknown) as { dataLayer: unknown[] }).dataLayer.push({
        event: eventName,
        ...data
      });
    }
  };

  const handleHeroCtaClick = (cta: string) => {
    trackEvent('hero_cta_click', { cta });
  };

  const handleHeroPillClick = (category: string, position: number) => {
    trackEvent('hero_pill_click', { category, position });
  };

  const handleFeaturedDealClick = (dealId: string) => {
    trackEvent('featured_deal_click', { id: dealId, badges: featuredDeal ? getDealBadges(featuredDeal) : [] });
  };

  const handleDealGridClick = (dealId: string, position: number) => {
    trackEvent('deal_grid_click', { id: dealId, position, section: 'this_weeks_steals' });
  };

  const handleCarouselDealClick = (dealId: string, position: number) => {
    trackEvent('carousel_deal_click', { id: dealId, position });
  };

  const handleCarouselScroll = (direction: 'left' | 'right') => {
    trackEvent('carousel_scroll', { section: 'under_50', direction });
  };

  const handleGuideClick = (guideId: string, position: number) => {
    trackEvent('guide_click', { id: guideId, position });
  };

  // Section impression tracking
  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const sectionId = entry.target.id;
            trackEvent('section_impression', { section: sectionId });
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all main sections
    const sections = ['deals-section', 'under-50-section', 'guides-section'];
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleMidFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMidFormLoading(true);
    setMidFormStatus("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const honeypot = formData.get("company") as string;
    const consent = formData.get("consent") as string;

    // Check honeypot
    if (honeypot) {
      setMidFormLoading(false);
      return;
    }

    // Check consent
    if (!consent) {
      setMidFormStatus("Please agree to receive emails to continue.");
      setMidFormLoading(false);
      return;
    }

    // Client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setMidFormStatus("Please enter a valid email address.");
      setMidFormLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          fullName: "Subscriber",
          email,
          interest: "waitlist",
          consent: true
        })
      });

      if (response.ok) {
        setMidFormStatus("Thanks—check your inbox!");
        (e.target as HTMLFormElement).reset();
        // Analytics
        if (typeof window !== "undefined" && (window as { dataLayer?: unknown[] }).dataLayer) {
          ((window as unknown) as { dataLayer: unknown[] }).dataLayer.push({
            event: "email_signup",
            location: "landing_band"
          });
        }
      } else {
        setMidFormStatus("Something went wrong. Please try again.");
      }
    } catch (error) {
      setMidFormStatus("Network error. Please check your connection and try again.");
    } finally {
      setMidFormLoading(false);
    }
  };

  return (
    <>
      {/* SEO and Structured Data */}
      <Head>
        <title>Best Puerto Rico Travel Deals - Hotels, Tours & Dining Discounts</title>
        <meta name="description" content="Find the best travel deals to Puerto Rico. Curated daily offers on flights, hotels, tours, and vacation packages. Start planning your perfect Caribbean getaway today!" />
        <meta name="keywords" content="Puerto Rico travel deals, Puerto Rico vacation deals, best deals Puerto Rico 2025, Puerto Rico hotel deals, San Juan deals, Culebra deals, Vieques deals, Puerto Rico restaurant deals, Caribbean vacation packages, Puerto Rico tours, Puerto Rico discounts, cheap Puerto Rico hotels, Puerto Rico activities, travel deals Caribbean" />
        <link rel="canonical" href="https://puertoricotraveldeals.com/" />
        <link rel="alternate" hrefLang="en" href="https://puertoricotraveldeals.com/" />
        <link rel="alternate" hrefLang="es" href="https://puertoricotraveldeals.com/es/" />
        <link rel="alternate" hrefLang="x-default" href="https://puertoricotraveldeals.com/" />
        <link rel="preload" as="image" href={heroBackgrounds[0]} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Puerto Rico Travel Deals",
              "url": "https://puertoricotraveldeals.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://puertoricotraveldeals.com/deals?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              ...organizationSchema,
              "@context": "https://schema.org",
              "@type": ["Organization", "ItemList"],
              "name": "Puerto Rico Travel Deals",
              "itemListElement": latestDeals.slice(0, 3).map((deal, index) => ({
                "@type": "Offer",
                "name": deal.title,
                "price": deal.price || "0",
                "priceCurrency": deal.currency || "USD",
                "availability": "InStock",
                "url": `https://puertoricotraveldeals.com/deal/${deal.slug}`,
                "position": index + 1
              }))
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />
      </Head>
      
      <div className="min-h-screen w-full bg-brand-sand text-brand-navy">
        {/* Top Announcement Ribbon */}
        <div className="w-full bg-brand-red text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-sm font-semibold tracking-wide sm:px-6">
            <span className="uppercase">Follow us on Instagram</span>
            <a href="https://www.instagram.com/puertoricotraveldeals" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/30 hover:bg-white/25">Follow ➜</a>
          </div>
        </div>

        {/* Header / Nav */}
        <LandingHeader />

        {/* Enhanced Hero */}
        {getFeatureFlag('ENHANCED_HERO') && (
          <EnhancedHero 
            backgrounds={heroBackgrounds}
            onCtaClick={handleHeroCtaClick}
            onPillClick={handleHeroPillClick}
          />
        )}

        {/* Wave Divider between Hero and Deals */}
        {getFeatureFlag('ENHANCED_HERO') && (
          <div className="relative -mt-px bg-white">
            <WaveDivider />
          </div>
        )}

        {/* SEO-Rich Intro Section */}
        <section className="relative -mt-px bg-white py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="prose prose-lg mx-auto text-center">
              <p className="text-brand-navy/80 leading-relaxed">
                Welcome to <strong>Puerto Rico Travel Deals</strong> - your premier destination for exclusive vacation packages and discounts across the island.
                From luxury <strong>beachfront resorts in Culebra and Vieques</strong> to authentic <strong>dining experiences in Old San Juan</strong>,
                we curate the best travel deals from verified local businesses. Whether you're planning a romantic getaway to <strong>Rincón</strong>,
                a family vacation in <strong>Condado</strong>, or exploring hidden gems in <strong>Ponce</strong>, discover handpicked offers that help you
                experience the real Puerto Rico without breaking the bank. Updated daily by locals who know the island best.
              </p>
            </div>
          </div>
        </section>

        {/* This Week's Steals Section */}
        <section id="deals-section" className="relative bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeader 
              title="This Week's Steals"
              subtitle="Discover the best-travel deals across Puerto Rico."
              className="mb-10"
            />
            
            {/* Featured Deal */}
            {getFeatureFlag('FEATURED_DEAL') && featuredDeal && (
              <div className="mb-10">
                <FeaturedDealCard 
                  deal={featuredDeal}
                  badges={getDealBadges(featuredDeal)}
                  onDealClick={handleFeaturedDealClick}
                />
              </div>
            )}
            
            {/* Deals Grid */}
            {latestDeals.length > 0 && (
              <div className="mb-10">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {latestDeals.map((deal, index) => (
                    <div key={deal.id} onClick={() => handleDealGridClick(deal.id || '', index)}>
                      <PublicDealCard deal={deal} />
                    </div>
                  ))}
                </div>
                
                {/* See More CTA */}
                <div className="mt-10 text-center">
                  <Link 
                    href="/deals" 
                    className="hover:bg-brand-navy/90 inline-flex items-center gap-3 rounded-full bg-brand-navy px-8 py-4 font-bold text-white shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
                  >
                    Show me more treasures →
                  </Link>
                </div>
              </div>
            )}
            
            {/* Fallback when no deals */}
            {latestDeals.length === 0 && (
              <div className="bg-brand-blue/10 ring-brand-blue/20 mt-8 rounded-3xl p-6 ring-1 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-2xl font-black text-brand-navy">New deals coming soon!</h3>
                  <Link href="/deals" className="hover:bg-brand-navy/90 inline-flex items-center gap-3 rounded-full bg-brand-navy px-5 py-3 font-bold text-white shadow">
                    Check Back Soon <span>→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Under $50 Carousel Section */}
        {getFeatureFlag('UNDER_50_CAROUSEL') && under50Deals.length > 0 && (
          <div id="under-50-section">
            <HorizontalCarousel
              deals={under50Deals}
              title="Top Picks Under $50"
              subtitle="Big fun, small budget"
              onDealClick={handleCarouselDealClick}
              onScroll={handleCarouselScroll}
            />
          </div>
        )}

        {/* Guides Section */}
        {getFeatureFlag('GUIDES_SECTION') && guides.length > 0 && (
          <div id="guides-section">
            <GuideRow
              guides={guides}
              title="Need inspiration?"
              subtitle="Not just deals—discover Puerto Rico your way."
              onGuideClick={handleGuideClick}
            />
          </div>
        )}

        {/* Email Signup Band */}
        <section id="newsletter" className="py-12">
          <div className="mx-auto grid max-w-6xl gap-0 px-4 sm:px-6 md:grid-cols-2">
            <div className="rounded-3xl bg-brand-red p-10 text-white md:rounded-l-3xl md:rounded-r-none">
              <h3 className="text-4xl font-black leading-tight">Don't miss next week's treasures.</h3>
            </div>
            <div className="rounded-3xl bg-brand-navy p-10 text-white md:rounded-l-none md:rounded-r-3xl">
              <form onSubmit={handleMidFormSubmit} className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    required
                    disabled={midFormLoading}
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    aria-label="Email address"
                  />
                  <button
                    type="submit"
                    disabled={midFormLoading}
                    className="hover:bg-brand-blue/90 rounded-xl bg-brand-blue px-5 py-3 font-bold text-white shadow transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {midFormLoading ? "..." : "Sign up"}
                  </button>
                </div>
                {/* Consent checkbox */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="consent"
                    id="consent-split"
                    required
                    disabled={midFormLoading}
                    className="mt-1 size-4 rounded border-slate-300 text-brand-blue focus:ring-2 focus:ring-brand-blue"
                  />
                  <label htmlFor="consent-split" className="text-sm text-white/90">
                    I agree to receive emails per the <a href="mailto:legal@puertoricotraveldeals.com" className="underline hover:text-white">Privacy Policy</a>.
                  </label>
                </div>
                {/* Honeypot field */}
                <input
                  type="text"
                  name="company"
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                {midFormStatus && (
                  <div aria-live="polite" className="text-sm">
                    {midFormStatus}
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Import server-side functions here to avoid client-side bundling
    const { 
      getFeaturedDeal,
      getLatestDeals,
      getUnder50Deals,
      getFeaturedGuides
    } = await import("@/lib/homepageQueries");
    
    const [featuredDeal, latestDeals, under50Deals, guides] = await Promise.all([
      getFeaturedDeal(),
      getLatestDeals(9),
      getUnder50Deals(),
      getFeaturedGuides(6)
    ]);
    
    const heroBackgrounds = getHeroBackgrounds();
    
    return {
      props: {
        featuredDeal,
        latestDeals,
        under50Deals,
        guides,
        heroBackgrounds
      },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    console.error('Error loading homepage data:', error);
    return {
      props: {
        featuredDeal: null,
        latestDeals: [],
        under50Deals: [],
        guides: [],
        heroBackgrounds: getHeroBackgrounds()
      },
      revalidate: 300 // Retry in 5 minutes if there's an error
    };
  }
};
