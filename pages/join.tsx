import React from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';

export default function Join() {
  return (
    <SiteLayout>
      <SEO 
        title="Join the Puerto Rico Travel Deals Waitlist"
        description="Get early access to limited-time Puerto Rico flight, hotel, and activity deals during our launch."
      />
      
      {/* Hero Section with Media Placeholder */}
      <Section>
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <Heading level={1}>Join</Heading>
            <p className="mt-4 text-lg text-brand-navy">Get early access to limited-time Puerto Rico flight, hotel, and activity deals during our launch.</p>
            <a 
              href="https://forms.example.com/prtd-waitlist" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:bg-brand-navy/90 mt-6 inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-bold text-white shadow"
            >
              Join Now ➜
            </a>
          </div>
          <div className="bg-brand-sand/30 grid h-64 place-items-center rounded-xl">
            <p className="text-brand-navy/60 font-semibold">Media Placeholder</p>
          </div>
        </div>
      </Section>

      {/* Launch Pitch */}
      <Section className="bg-brand-blue/5">
        <div className="text-center">
          <Heading level={2}>Exclusive Launch Access</Heading>
          <p className="mt-4 text-lg text-brand-navy">Be among the first to discover Puerto Rico&apos;s best-kept travel secrets. Join our waitlist for priority access to handpicked deals from trusted local partners.</p>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section>
        <Heading level={2}>What You Get</Heading>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="bg-brand-blue/5 ring-brand-blue/20 rounded-xl p-6 ring-1">
            <h3 className="text-xl font-bold text-brand-navy">Early Bird Deals</h3>
            <p className="mt-2 text-brand-navy">First access to launch-week exclusive offers before they go public.</p>
          </div>
          <div className="bg-brand-red/5 ring-brand-red/20 rounded-xl p-6 ring-1">
            <h3 className="text-xl font-bold text-brand-navy">Transparent Pricing</h3>
            <p className="mt-2 text-brand-navy">All taxes and fees included upfront—no hidden surprises.</p>
          </div>
          <div className="bg-brand-sand/30 ring-brand-navy/20 rounded-xl p-6 ring-1">
            <h3 className="text-xl font-bold text-brand-navy">Flexible Vouchers</h3>
            <p className="mt-2 text-brand-navy">Easy booking with trusted partners and flexible redemption options.</p>
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section className="bg-white">
        <Heading level={2}>How It Works</Heading>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-navy text-lg font-bold text-white">1</div>
            <h3 className="mt-3 font-bold text-brand-navy">Join the Waitlist</h3>
            <p className="text-brand-navy/80 mt-2 text-sm">Sign up and tell us your travel preferences and timeline.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-blue text-lg font-bold text-white">2</div>
            <h3 className="mt-3 font-bold text-brand-navy">Get Notified</h3>
            <p className="text-brand-navy/80 mt-2 text-sm">Receive exclusive deals tailored to your interests before launch.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-red text-lg font-bold text-white">3</div>
            <h3 className="mt-3 font-bold text-brand-navy">Book & Save</h3>
            <p className="text-brand-navy/80 mt-2 text-sm">Redeem your deals and enjoy Puerto Rico at unbeatable prices.</p>
          </div>
        </div>
      </Section>

      {/* Brief FAQ */}
      <Section>
        <Heading level={2}>Quick Questions</Heading>
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="font-bold text-brand-navy">When will deals be available?</h3>
            <p className="text-brand-navy/80 mt-2">Launch is planned for early 2025. Waitlist members get first access to preview deals.</p>
          </div>
          <div>
            <h3 className="font-bold text-brand-navy">What types of deals will you offer?</h3>
            <p className="text-brand-navy/80 mt-2">Flights, hotels, restaurants, tours, and activities from verified Puerto Rico partners.</p>
          </div>
          <div>
            <h3 className="font-bold text-brand-navy">Is there a cost to join?</h3>
            <p className="text-brand-navy/80 mt-2">No, joining the waitlist is completely free with no commitments.</p>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="bg-brand-navy text-white">
        <div className="text-center">
          <Heading level={2} className="text-white">Ready to Discover Puerto Rico?</Heading>
          <p className="mt-4 text-white/90">Join thousands of travelers getting exclusive access to Puerto Rico&apos;s best deals.</p>
          <a 
            href="https://forms.example.com/prtd-waitlist" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-brand-navy shadow hover:bg-white/90"
          >
            Join Now ➜
          </a>
        </div>
      </Section>
    </SiteLayout>
  );
}
