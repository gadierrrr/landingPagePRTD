import React from 'react';
import Link from 'next/link';

export const LandingHeader: React.FC = () => (
  <header className="bg-white shadow-sm">
    <div className="mx-auto flex max-w-6xl items-center p-4 sm:px-6">
      <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
        <div className="grid size-9 place-items-center rounded-lg bg-brand-blue text-lg text-white">★</div>
        <span className="text-xl font-extrabold tracking-tight text-brand-navy">PRTD</span>
      </Link>
      <div className="ml-auto flex items-center gap-6">
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link className="hover:text-brand-blue" href="/deals">Deals</Link>
          <Link className="hover:text-brand-blue" href="/guides">Guides</Link>
          <Link className="hover:text-brand-blue" href="/beachfinder">Beach Finder</Link>
          <Link className="hover:text-brand-blue" href="/travel-pass">Travel Pass</Link>
          <Link className="hover:text-brand-blue" href="/about">About Us</Link>
          <Link className="hover:text-brand-blue" href="/partner">Submit a Deal</Link>
        </nav>
        <Link href="/deals" className="hover:bg-brand-red/90 rounded-full bg-brand-red px-4 py-2 font-bold text-white shadow">See Deals</Link>
      </div>
    </div>
  </header>
);
