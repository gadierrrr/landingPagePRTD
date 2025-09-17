import React from 'react';
import Link from 'next/link';

export const LandingHero: React.FC = () => (
  <section className="bg-brand-navy text-white">
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-brand-blue p-6 ring-1 ring-white/20 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_40%)] opacity-10" />
        <div className="relative z-10 grid place-items-center gap-8">
          <div className="text-center">
            <p className="font-bold uppercase tracking-widest text-white/80">PRTD • Puerto Rico Travel Deals</p>
            <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Puerto Rico travel deals, updated daily.</h1>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                { label: "Hotels", category: "hotel" },
                { label: "Activities", category: "activity" },
                { label: "Food", category: "restaurant" },
                { label: "Tours", category: "tour" }
              ].map(({ label, category }) => (
                <Link 
                  key={label} 
                  href={`/deals?category=${category}`}
                  className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 ring-1 ring-white/30 transition-colors hover:bg-white/25 hover:ring-white/40"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/deals" className="hover:bg-brand-red/90 rounded-full bg-brand-red px-5 py-3 font-bold shadow">Browse Deals</Link>
              <Link 
                href="/travel-pass" 
                className="rounded-full bg-white/15 px-5 py-3 font-bold ring-1 ring-white/30 hover:bg-white/20"
              >
                Travel Pass
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
