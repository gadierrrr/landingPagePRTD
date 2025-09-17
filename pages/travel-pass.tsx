import React from 'react';
import { SEO } from '../src/ui/SEO';
import { LandingHeader } from '../src/ui/landing/LandingHeader';
import { Footer } from '../src/ui/Footer';
import Image from 'next/image';

export default function TravelPass() {
  return (
    <>
      <SEO 
        title="Puerto Rico Travel Pass - Paradise. For less."
        description="Choose your pass and unlock curated savings across Puerto Rico— instant, QR-based, and easy."
        canonical="/travel-pass"
      />
      
      <div className="min-h-screen w-full bg-brand-sand text-brand-navy">
        {/* Header / Nav */}
        <LandingHeader />

        {/* Hero Section - Blue Gradient Background */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue to-brand-navy">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Column - Text */}
              <div className="text-white">
                <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Puerto Rico Travel Pass
                </h1>
                <h2 className="text-4xl font-black leading-tight text-brand-sand sm:text-5xl lg:text-6xl">
                  — Paradise. For less.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-white/90 sm:text-xl">
                  Choose your pass and unlock curated savings across Puerto Rico— instant, QR-based, and easy.
                </p>
                
                {/* CTAs */}
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="/api/checkout?pass=city"
                    data-cta="travel-pass-hero-city"
                    className="hover:bg-brand-red/90 inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-8 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl"
                    aria-label="Get the City Pass for $29"
                  >
                    Coming Soon
                  </a>
                  <a
                    href="/api/checkout?pass=island"
                    data-cta="travel-pass-hero-island"
                    className="hover:bg-brand-blue/90 inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-8 py-4 font-bold text-white shadow-lg ring-2 ring-white/20 transition-all hover:shadow-xl"
                    aria-label="Get the Island Pass for $59"
                  >
                    Coming Soon
                  </a>
                </div>
              </div>
              
              {/* Right Column - Phone Mockups */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative">
                  <Image
                    src="/images/passMockup.png"
                    alt="Two digital PRTD passes on phones: City Pass and Island Pass"
                    width={500}
                    height={600}
                    className="w-full max-w-md object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards Section with Navy Background Overlap */}
        <section className="relative">
          {/* Navy background that extends up */}
          <div className="absolute inset-x-0 top-0 h-24 bg-brand-navy"></div>
          
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="-mt-16 grid gap-8 md:grid-cols-2">
              {/* City Pass Card */}
              <div className="ring-brand-navy/10 overflow-hidden rounded-xl bg-white shadow-lg ring-1">
                <div className="p-8">
                  <h3 className="mb-2 text-2xl font-black text-brand-navy">City Pass</h3>
                  <div className="mb-4 text-4xl font-black text-brand-navy">$29</div>
                  <p className="text-brand-navy/70 mb-6">
                    Perfect for those exploring Old San Juan, Condado, and Santurce.
                  </p>
                  
                  {/* Bullet Points */}
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-blue">
                        <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-brand-navy">Dining & bar discounts</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-blue">
                        <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-brand-navy">Entry deals for local attractions</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-blue">
                        <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-brand-navy">Valid for 3 days</span>
                    </li>
                  </ul>
                  
                  <a
                    href="/api/checkout?pass=city"
                    data-cta="travel-pass-card-city"
                    className="hover:bg-brand-red/90 block w-full rounded-full bg-brand-red px-6 py-3 text-center font-bold text-white shadow-md transition-all hover:shadow-lg"
                    aria-label="Buy City Pass for $29"
                  >
                    Coming Soon
                  </a>
                </div>
              </div>

              {/* Island Pass Card */}
              <div className="ring-brand-navy/10 overflow-hidden rounded-xl bg-white shadow-lg ring-1">
                <div className="p-8">
                  <h3 className="mb-2 text-2xl font-black text-brand-navy">Island Pass</h3>
                  <div className="mb-4 text-4xl font-black text-brand-navy">$59</div>
                  <p className="text-brand-navy/70 mb-6">
                    Ideal for travelers venturing across the Island—from El Yunque to Cabo Rojo.
                  </p>
                  
                  {/* Bullet Points */}
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-blue">
                        <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-brand-navy">Everything in City Pass</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-blue">
                        <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-brand-navy">Tours & excursions across the island</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-blue">
                        <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-brand-navy">Valid for 7 days</span>
                    </li>
                  </ul>
                  
                  <a
                    href="/api/checkout?pass=island"
                    data-cta="travel-pass-card-island"
                    className="hover:bg-brand-blue/90 block w-full rounded-full bg-brand-blue px-6 py-3 text-center font-bold text-white shadow-md transition-all hover:shadow-lg"
                    aria-label="Buy Island Pass for $59"
                  >
                    Coming Soon
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-brand-sand py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-12 text-center text-3xl font-black text-brand-navy sm:text-4xl">
              How It Works
            </h2>
            
            {/* Three Steps */}
            <div className="mb-12 grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-blue text-xl font-black text-white">
                  1
                </div>
                <h3 className="mb-2 text-xl font-bold text-brand-navy">Choose Your Pass</h3>
                <p className="text-brand-navy/70">Select City or Island.</p>
              </div>
              
              {/* Step 2 */}
              <div className="text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-blue text-xl font-black text-white">
                  2
                </div>
                <h3 className="mb-2 text-xl font-bold text-brand-navy">Get Your QR</h3>
                <p className="text-brand-navy/70">Instant delivery via email & wallet app.</p>
              </div>
              
              {/* Step 3 */}
              <div className="text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-blue text-xl font-black text-white">
                  3
                </div>
                <h3 className="mb-2 text-xl font-bold text-brand-navy">Redeem & Save</h3>
                <p className="text-brand-navy/70">Show at participating vendors and enjoy.</p>
              </div>
            </div>
            
            {/* Feature Chips */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
                <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure payments
              </div>
              <div className="flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
                <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Clear fine print
              </div>
              <div className="flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
                <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                100% Puerto Rican owned
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Testimonial 1 */}
              <div className="bg-brand-sand/50 ring-brand-navy/10 rounded-xl p-8 shadow-sm ring-1">
                <p className="mb-4 text-2xl font-bold text-brand-navy">
                  Launching soon.
                </p>
                <p className="text-brand-navy/70">Be among the first to unlock exclusive island savings.</p>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-brand-sand/50 ring-brand-navy/10 rounded-xl p-8 shadow-sm ring-1">
                <p className="mb-4 text-2xl font-bold text-brand-navy">
                  Be among the first to unlock exclusive island savings.
                </p>
                <p className="text-brand-navy/70">Coming soon</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}