import React from 'react';

export const LandingHeader: React.FC = () => (
  <header className="bg-white shadow-sm">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-brand-blue grid place-items-center text-white text-lg">★</div>
        <span className="font-extrabold tracking-tight text-brand-navy text-xl">PRTD</span>
      </div>
      <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
        <a className="hover:text-brand-blue" href="#deals">Deals</a>
        <a className="hover:text-brand-blue" href="#how">How it works</a>
        <a className="hover:text-brand-blue" href="#value">What we do</a>
        <a className="hover:text-brand-blue" href="#partners">Partners</a>
        <a className="hover:text-brand-blue" href="#faq">FAQ</a>
      </nav>
      <a href="#waitlist" className="rounded-full bg-brand-red text-white px-4 py-2 font-bold shadow hover:bg-brand-red/90">Join the Waitlist</a>
    </div>
  </header>
);
