import React from "react";
import Link from "next/link";
import { LandingHeader } from "@/ui/landing/LandingHeader";
import { LandingHero } from "@/ui/landing/LandingHero";
import { Footer } from "@/ui/Footer";

// Puerto Rico Flag palette - see src/styles/tokens.css for hex values
// Whites and tints for contrast; large type + bold CTAs inspired by provided screenshots.

export default function PRTDPRFlagLanding() {

  return (
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

      {/* NEW DEALS CTA */}
  <section id="deals" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="bg-brand-blue/10 ring-brand-blue/20 rounded-3xl p-6 ring-1 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-black text-brand-navy sm:text-4xl">SEE AVAILABLE DEALS</h2>
              <Link href="/deals" className="hover:bg-brand-navy/90 inline-flex items-center gap-3 rounded-full bg-brand-navy px-5 py-3 font-bold text-white shadow">
                See Deals <span>➜</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Split Banner: Connect + Mission (inspired by screenshots) */}
      <section className="">
        <div className="mx-auto grid max-w-6xl gap-0 px-4 sm:px-6 md:grid-cols-2">
          <div className="rounded-3xl bg-brand-red p-10 text-white md:rounded-l-3xl md:rounded-r-none">
            <h3 className="text-4xl font-black leading-tight">BE PART OF OUR NEXT PHASE.</h3>
          </div>
          <div className="rounded-3xl bg-brand-navy p-10 text-white md:rounded-l-none md:rounded-r-3xl">
            <p className="text-xl leading-relaxed">Our goal is to help local businesses grow by offering exclusive deals to the millions of travelers who visit Puerto Rico each year. Discover how below.</p>
          </div>
        </div>
      </section>

      {/* What we can do for you */}
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

      {/* Anchor placeholders to preserve CTA functionality */}
      <div id="waitlist" className="sr-only" aria-hidden="true" />
      <div id="partners" className="sr-only" aria-hidden="true" />

      {/* Partners Logos */}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
