import React from 'react';

export const LandingHeader: React.FC = () => (
  <header className="bg-white shadow-sm">
    <div className="mx-auto flex max-w-6xl items-center justify-between p-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-lg bg-brand-blue text-lg text-white">★</div>
        <span className="text-xl font-extrabold tracking-tight text-brand-navy">PRTD</span>
      </div>
      <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
        <a className="hover:text-brand-blue" href="#deals">Deals</a>
        <a className="hover:text-brand-blue" href="#how">How it works</a>
        <a className="hover:text-brand-blue" href="#value">What we do</a>
        <a className="hover:text-brand-blue" href="#partners">Partners</a>
        <a className="hover:text-brand-blue" href="#faq">FAQ</a>
      </nav>
      <a href="#waitlist" className="hover:bg-brand-red/90 rounded-full bg-brand-red px-4 py-2 font-bold text-white shadow">Join the Waitlist</a>
    </div>
  </header>
);
