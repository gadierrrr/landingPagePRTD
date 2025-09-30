import React, { useState } from 'react';
import Link from 'next/link';

export const LandingHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center p-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="grid size-9 place-items-center rounded-lg bg-brand-blue text-lg text-white">★</div>
          <span className="text-xl font-extrabold tracking-tight text-brand-navy">PRTD</span>
        </Link>
        <div className="ml-auto flex items-center gap-6">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <Link className="hover:text-brand-blue" href="/deals">Deals</Link>
            <Link className="hover:text-brand-blue" href="/guides">Guides</Link>
            <Link className="hover:text-brand-blue" href="/beachfinder">Beach Finder</Link>
            <Link className="hover:text-brand-blue" href="/travel-pass">Travel Pass</Link>
            <Link className="hover:text-brand-blue" href="/about">About Us</Link>
            <Link className="hover:text-brand-blue" href="/partner">Submit a Deal</Link>
          </nav>
          <Link href="/deals" className="hover:bg-brand-red/90 hidden rounded-full bg-brand-red px-4 py-2 font-bold text-white shadow md:block">See Deals</Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="hover:bg-brand-navy/10 inline-flex items-center justify-center rounded-lg p-2 text-brand-navy transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              // Close icon
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Menu Drawer */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-brand-navy/10 flex items-center justify-between border-b p-4">
                <span className="text-lg font-extrabold text-brand-navy">Menu</span>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="hover:bg-brand-navy/10 inline-flex items-center justify-center rounded-lg p-2 text-brand-navy transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  aria-label="Close navigation menu"
                >
                  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-2">
                  <Link
                    href="/deals"
                    className="hover:bg-brand-navy/5 rounded-lg px-4 py-3 text-base font-semibold text-brand-navy transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Deals
                  </Link>
                  <Link
                    href="/guides"
                    className="hover:bg-brand-navy/5 rounded-lg px-4 py-3 text-base font-semibold text-brand-navy transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Guides
                  </Link>
                  <Link
                    href="/beachfinder"
                    className="hover:bg-brand-navy/5 rounded-lg px-4 py-3 text-base font-semibold text-brand-navy transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Beach Finder
                  </Link>
                  <Link
                    href="/travel-pass"
                    className="hover:bg-brand-navy/5 rounded-lg px-4 py-3 text-base font-semibold text-brand-navy transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Travel Pass
                  </Link>
                  <Link
                    href="/about"
                    className="hover:bg-brand-navy/5 rounded-lg px-4 py-3 text-base font-semibold text-brand-navy transition-colors"
                    onClick={closeMobileMenu}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/partner"
                    className="hover:bg-brand-navy/5 rounded-lg px-4 py-3 text-base font-semibold text-brand-navy transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Submit a Deal
                  </Link>
                </div>
              </nav>

              {/* CTA Button */}
              <div className="border-brand-navy/10 border-t p-4">
                <Link
                  href="/deals"
                  className="hover:bg-brand-red/90 block rounded-full bg-brand-red px-6 py-3 text-center font-bold text-white shadow transition-colors"
                  onClick={closeMobileMenu}
                >
                  See Deals
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
