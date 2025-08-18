import React from 'react';

export const LandingHero: React.FC = () => (
  <section className="bg-brand-navy text-white">
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-brand-blue p-6 ring-1 ring-white/20 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_40%)] opacity-10" />
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="font-bold uppercase tracking-widest text-white/80">PRTD • Puerto Rico Travel Deals</p>
            <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">THE TIME TO SAVE IS NOW!</h1>
            <p className="mt-3 text-lg text-white/90">Island‑wide discounts on hotels, dining, and experiences—curated by locals. Launching soon.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Hotels","Food","Experiences","Flights"].map(x => (
                <span key={x} className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 ring-1 ring-white/30">{x}</span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#waitlist" className="hover:bg-brand-red/90 rounded-full bg-brand-red px-5 py-3 font-bold shadow">Join the Waitlist</a>
              <a href="#partners" className="rounded-full bg-white/15 px-5 py-3 font-bold ring-1 ring-white/30 hover:bg-white/20">Become a Partner</a>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20">
            <div className="grid grid-cols-2 gap-2 p-2">
              {[0,1,2,3].map(i => (
                <div key={i} className="grid aspect-video place-items-center bg-white/20 text-5xl">📸</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
