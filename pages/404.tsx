import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Puerto Rico Travel Deals</title>
        <meta name="description" content="The page you're looking for doesn't exist. Browse our latest Puerto Rico travel deals, guides, and beach finder." />
        <meta name="robots" content="noindex,follow" />
      </Head>

      <SiteLayout>
        <Section>
          <div className="mx-auto max-w-3xl text-center">
            {/* Error Code */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center rounded-full bg-brand-sand px-6 py-3">
                <span className="text-6xl font-black text-brand-navy">404</span>
              </div>
            </div>

            {/* Heading */}
            <Heading level={1} className="mb-4">
              Oops! Page Not Found
            </Heading>

            {/* Description */}
            <p className="text-brand-navy/70 mb-8 text-lg">
              Looks like this treasure got buried too deep. Let's get you back on track.
            </p>

            {/* Navigation Links */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/"
                className="hover:bg-brand-navy/90 inline-flex items-center gap-2 rounded-full bg-brand-navy px-8 py-4 font-bold text-white shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </Link>

              <Link
                href="/deals"
                className="hover:bg-brand-red/90 inline-flex items-center gap-2 rounded-full bg-brand-red px-8 py-4 font-bold text-white shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Browse Deals
              </Link>
            </div>

            {/* Additional Links */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold">
              <Link href="/guides" className="text-brand-navy transition-colors hover:text-brand-blue">
                Travel Guides
              </Link>
              <span className="text-brand-navy/30">•</span>
              <Link href="/beachfinder" className="text-brand-navy transition-colors hover:text-brand-blue">
                Beach Finder
              </Link>
              <span className="text-brand-navy/30">•</span>
              <Link href="/about" className="text-brand-navy transition-colors hover:text-brand-blue">
                About Us
              </Link>
            </div>

            {/* Decorative Element */}
            <div className="mt-16">
              <p className="text-brand-navy/40 text-sm">
                Need help? <a href="mailto:hello@puertoricotraveldeals.com" className="text-brand-blue hover:underline">Contact us</a>
              </p>
            </div>
          </div>
        </Section>
      </SiteLayout>
    </>
  );
}