import React from 'react';

export const LandingHero: React.FC = () => (
  <section className="bg-brand-navy text-white">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="rounded-3xl ring-1 ring-white/20 bg-brand-blue p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_0%,white,transparent_40%),radial-gradient(circle_at_80%_100%,white,transparent_40%)]" />
        <div className="grid lg:grid-cols-2 gap-8 items-center relative z-10">
          <div>
            <p className="uppercase tracking-widest font-bold text-white/80">PRTD • Puerto Rico Travel Deals</p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-black leading-tight">THE TIME TO SAVE IS NOW!</h1>
            <p className="mt-3 text-white/90 text-lg">Island‑wide discounts on hotels, dining, and experiences—curated by locals. Launching soon.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Hotels","Food","Experiences","Flights"].map(x => (
                <span key={x} className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 ring-1 ring-white/30">{x}</span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#waitlist" className="rounded-full bg-brand-red px-5 py-3 font-bold shadow hover:bg-brand-red/90">Join the Waitlist</a>
              <a href="#partners" className="rounded-full bg-white/15 px-5 py-3 font-bold ring-1 ring-white/30 hover:bg-white/20">Become a Partner</a>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-white/10 ring-1 ring-white/20">
            <div className="grid grid-cols-2 gap-2 p-2">
              {[0,1,2,3].map(i => (
                <div key={i} className="aspect-video bg-white/20 grid place-items-center text-5xl">📸</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
