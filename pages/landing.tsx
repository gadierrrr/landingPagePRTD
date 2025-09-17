import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { GetStaticProps } from "next";
import { LandingHeader } from "@/ui/landing/LandingHeader";
import { LandingHero } from "@/ui/landing/LandingHero";
import { Footer } from "@/ui/Footer";
import { PublicDealCard } from "@/ui/deals/PublicDealCard";
import { generateOrganizationSchema } from "@/lib/seo";
import { Deal } from "@/lib/forms";
import { readDeals } from "@/lib/dealsStore";
import { selectHomepageDeals } from "@/lib/homepageDeals";

// Puerto Rico Flag palette - see src/styles/tokens.css for hex values
// Whites and tints for contrast; large type + bold CTAs inspired by provided screenshots.

// Feature flag to hide sections during prelaunch
const PRELAUNCH = true;

interface LandingProps {
  featuredDeals: Deal[];
}

export default function PRTDPRFlagLanding({ featuredDeals = [] }: LandingProps) {
  const [midFormStatus, setMidFormStatus] = useState<string>("");
  const [midFormLoading, setMidFormLoading] = useState(false);
  
  // Generate organization structured data
  const organizationSchema = generateOrganizationSchema();

  // Track deals section view
  React.useEffect(() => {
    if (!featuredDeals || featuredDeals.length === 0) return;
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Fire analytics event only once
            if (typeof window !== "undefined" && (window as { dataLayer?: unknown[] }).dataLayer) {
              ((window as unknown) as { dataLayer: unknown[] }).dataLayer.push({
                event: "home_deals_section_view",
                cards_shown: featuredDeals.length,
                categories_shown: Array.from(new Set(featuredDeals.map(d => d.category))).join(','),
                section_version: "v1-mixed-grid"
              });
            }
            observer.disconnect(); // Only fire once
          }
        });
      },
      { threshold: 0.5 }
    );

    const dealsSection = document.getElementById('deals');
    if (dealsSection) {
      observer.observe(dealsSection);
    }

    return () => observer.disconnect();
  }, [featuredDeals]);

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
      {/* Organization Structured Data */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
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

  {/* Hero Carousel-style Panel */}
  <LandingHero />

      {/* Proof Row */}
      <section className="bg-brand-sand/50 border-brand-navy/10 border-y">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="text-brand-navy/70 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <div className="size-2 rounded-full bg-brand-blue"></div>
              Curated from top sources
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <div className="size-2 rounded-full bg-brand-red"></div>
              Updated daily
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <div className="size-2 rounded-full bg-brand-navy"></div>
              Free to use
            </div>
          </div>
        </div>
      </section>

      {/* Latest Deals Section */}
      <section id="deals" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-black text-brand-navy sm:text-4xl">Latest Deals</h2>
            <p className="text-brand-navy/70 mt-4">Discover the best travel deals across Puerto Rico</p>
          </div>
          
          {featuredDeals && featuredDeals.length > 0 && (
            <div className="mt-10">
              {/* Deals Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredDeals.map((deal, index) => (
                  <div 
                    key={deal.id}
                    onClick={() => {
                      if (typeof window !== "undefined" && (window as { dataLayer?: unknown[] }).dataLayer) {
                        ((window as unknown) as { dataLayer: unknown[] }).dataLayer.push({
                          event: "home_deal_click",
                          slug: deal.slug,
                          category: deal.category,
                          position: index + 1,
                          section_version: "v1-mixed-grid"
                        });
                      }
                    }}
                  >
                    <PublicDealCard 
                      deal={{
                        ...deal,
                        externalUrl: deal.externalUrl ? `${deal.externalUrl}${deal.externalUrl.includes('?') ? '&' : '?'}src=home_deals` : undefined
                      }}
                    />
                  </div>
                ))}
              </div>
              
              {/* See More CTA */}
              <div className="mt-10 text-center">
                <Link 
                  href="/deals" 
                  className="hover:bg-brand-navy/90 inline-flex items-center gap-3 rounded-full bg-brand-navy px-8 py-4 font-bold text-white shadow-lg transition-colors"
                  onClick={() => {
                    if (typeof window !== "undefined" && (window as { dataLayer?: unknown[] }).dataLayer) {
                      ((window as unknown) as { dataLayer: unknown[] }).dataLayer.push({
                        event: "home_deals_see_more_click",
                        section_version: "v1-mixed-grid"
                      });
                    }
                  }}
                >
                  See More Deals <span>➜</span>
                </Link>
                
                {/* Deep Links */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
                  <Link href="/deals?category=hotel" className="text-brand-blue hover:text-brand-navy hover:underline">More Hotels</Link>
                  <span className="text-brand-navy/30">·</span>
                  <Link href="/deals?category=activity" className="text-brand-blue hover:text-brand-navy hover:underline">More Activities</Link>
                  <span className="text-brand-navy/30">·</span>
                  <Link href="/deals?category=restaurant" className="text-brand-blue hover:text-brand-navy hover:underline">More Restaurants</Link>
                </div>
              </div>
            </div>
          )}
          
          {(!featuredDeals || featuredDeals.length === 0) && (
            <div className="bg-brand-blue/10 ring-brand-blue/20 mt-8 rounded-3xl p-6 ring-1 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-2xl font-black text-brand-navy">New deals coming soon!</h3>
                <Link href="/deals" className="hover:bg-brand-navy/90 inline-flex items-center gap-3 rounded-full bg-brand-navy px-5 py-3 font-bold text-white shadow">
                  Check Back Soon <span>➜</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Split Banner: Email Capture CTA */}
      <section id="newsletter" className="">
        <div className="mx-auto grid max-w-6xl gap-0 px-4 sm:px-6 md:grid-cols-2">
          <div className="rounded-3xl bg-brand-red p-10 text-white md:rounded-l-3xl md:rounded-r-none">
            <h3 className="text-4xl font-black leading-tight">Get Puerto Rico travel deals in your inbox.</h3>
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
                  className="hover:bg-brand-blue/90 rounded-xl bg-brand-blue px-5 py-3 font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* What we can do for you */}
      {!PRELAUNCH && (
      <section id="value" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h3 className="text-center text-3xl font-black sm:text-4xl">WHAT WE CAN DO FOR YOU</h3>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {/* Travelers */}
            <div className="bg-brand-blue/5 ring-brand-blue/20 rounded-3xl p-6 ring-1 sm:p-8">
              <h4 className="text-3xl font-black text-brand-navy">TRAVELERS</h4>
              <ul className="mt-4 space-y-3 text-lg text-brand-navy">
                <li>• Join the waitlist and tell us your trip window</li>
                <li>• Get first dibs on launch‑week coupons</li>
                <li>• Transparent prices (taxes & fees up front)</li>
                <li>• Trusted partners and flexible vouchers</li>
              </ul>
              <a href="https://puertoricotraveldeals.com/join" className="hover:bg-brand-navy/90 mt-6 inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-bold text-white shadow">Join the Waitlist ➜</a>
            </div>
            {/* Businesses */}
            <div className="bg-brand-red/5 ring-brand-red/20 rounded-3xl p-6 ring-1 sm:p-8">
              <h4 className="text-3xl font-black text-brand-navy">BUSINESSES</h4>
              <ul className="mt-4 space-y-3 text-lg text-brand-navy">
                <li>• Meet new customers without upfront ad spend</li>
                <li>• Launch‑week marketing boost</li>
                <li>• Vendor dashboard to track redemptions</li>
                <li>• Predictable payouts</li>
              </ul>
              <Link href="/partner" className="hover:bg-brand-red/90 mt-6 inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3 font-bold text-white shadow">Become a Partner ➜</Link>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Anchor placeholders to preserve CTA functionality */}
      <div id="waitlist" className="sr-only" aria-hidden="true" />
      <div id="partners" className="sr-only" aria-hidden="true" />

      {/* Partners Logos */}
      {!PRELAUNCH && (
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h3 className="text-center text-3xl font-black sm:text-4xl">OUR PARTNERS</h3>
          <div className="mt-6 grid grid-cols-2 items-center gap-6 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => {
              // Show El Lado Bueno logo as first partner
              if (i === 0) {
                return (
                  <div key={i} className="bg-brand-navy/5 ring-brand-navy/10 hover:bg-brand-navy/10 grid h-16 place-items-center rounded-xl ring-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/partners/el-lado-bueno.svg" 
                      alt="El Lado Bueno logo" 
                      className="max-h-12 max-w-full object-contain"
                    />
                  </div>
                );
              }
              // Keep other slots as placeholders for now
              return (
                <div key={i} className="bg-brand-navy/5 ring-brand-navy/10 text-brand-navy/60 grid h-16 place-items-center rounded-xl font-bold ring-1">Logo</div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <a href="#partners" className="hover:bg-brand-blue/90 inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3 font-bold text-white shadow">View all ➜</a>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const allDeals = await readDeals();
    const featuredDeals = selectHomepageDeals(allDeals, 6);
    
    return {
      props: {
        featuredDeals
      },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    console.error('Error loading deals for homepage:', error);
    return {
      props: {
        featuredDeals: []
      },
      revalidate: 300 // Retry in 5 minutes if there's an error
    };
  }
};
