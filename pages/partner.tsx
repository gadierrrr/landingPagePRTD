import React from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { Button } from '../src/ui/Button';
import { SEO } from '../src/ui/SEO';

export default function Partners() {
  return (
    <SiteLayout>
      <SEO 
        title="Partner with Puerto Rico Travel Deals"
        description="Reach travelers with zero upfront cost. List a high-value launch deal and drive redemptions with clear reporting."
      />
      <Section>
        <Heading level={1}>Partners</Heading>
        <p className="mt-4">Partner with PRTD to get your launch deal in front of travelers. We handle demand, you set the offer—no upfront fees.</p>
        <div className="mt-6">
          <Button className="mr-3">Become a Partner</Button>
        </div>
      </Section>

      <Section id="why-partner">
        <Heading level={2}>Why partner with PRTD</Heading>
        <ul className="mt-4 space-y-3 text-brand-navy">
          <li>• Reach new travelers exploring Puerto Rico</li>
          <li>• Zero upfront cost to list your launch deal</li>
          <li>• Easy redemption process for customers</li>
          <li>• Clear reporting and settlement tracking</li>
        </ul>
      </Section>

      <Section id="how-it-works">
        <Heading level={2}>How it works</Heading>
        <ol className="mt-4 space-y-3 text-brand-navy">
          <li>1. Create your high-value launch deal</li>
          <li>2. Get featured on our platform</li>
          <li>3. Travelers discover and redeem your offer</li>
          <li>4. Receive settlements and detailed reporting</li>
        </ol>
      </Section>

      <Section id="faq">
        <Heading level={2}>FAQ</Heading>
        <div className="mt-4 space-y-4">
          <div>
            <p className="font-semibold text-brand-navy">What types of businesses can partner with PRTD?</p>
            <p className="mt-2">We work with restaurants, tours, accommodations, activities, and retail businesses across Puerto Rico.</p>
          </div>
          <div>
            <p className="font-semibold text-brand-navy">How long does it take to get listed?</p>
            <p className="mt-2">Once approved, your deal can be live within 48 hours with all marketing materials ready.</p>
          </div>
          <div>
            <p className="font-semibold text-brand-navy">What commission do you charge?</p>
            <p className="mt-2">We only earn when you do—commission is applied only on successful redemptions, no upfront fees.</p>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}
