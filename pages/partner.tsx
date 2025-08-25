import React from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { Button } from '../src/ui/Button';
import { SEO } from '../src/ui/SEO';

// Feature flag to simplify partners page for Google Form integration
const PARTNERS_SIMPLIFIED = true as const;

export default function Partners() {
  return (
    <SiteLayout>
      <SEO 
        title="Partner with Puerto Rico Travel Deals"
        description="Reach travelers with zero upfront cost. List a high-value launch deal and drive redemptions with clear reporting."
      />
      {!PARTNERS_SIMPLIFIED && (
        <Section>
          <Heading level={1}>Partners</Heading>
          <p className="mt-4">Partner with PRTD to get your launch deal in front of travelers. We handle demand, you set the offer—no upfront fees.</p>
          <div className="mt-6">
            <Button className="mr-3">Become a Partner</Button>
          </div>
        </Section>
      )}

      {!PARTNERS_SIMPLIFIED && (
        <Section id="why-partner">
          <Heading level={2}>Why partner with PRTD</Heading>
          <ul className="mt-4 space-y-3 text-brand-navy">
            <li>• Reach new travelers exploring Puerto Rico</li>
            <li>• Zero upfront cost to list your launch deal</li>
            <li>• Easy redemption process for customers</li>
            <li>• Clear reporting and settlement tracking</li>
          </ul>
        </Section>
      )}

      {!PARTNERS_SIMPLIFIED && (
        <Section id="how-it-works">
          <Heading level={2}>How it works</Heading>
          <ol className="mt-4 space-y-3 text-brand-navy">
            <li>1. Create your high-value launch deal</li>
            <li>2. Get featured on our platform</li>
            <li>3. Travelers discover and redeem your offer</li>
            <li>4. Receive settlements and detailed reporting</li>
          </ol>
        </Section>
      )}

      {PARTNERS_SIMPLIFIED && (
        <section id="apply" className="bg-brand-sand">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <iframe 
                src="https://docs.google.com/forms/d/e/1FAIpQLSc4hPDQbp-K3IPsmpNsUVG14LdzixrmXsAsN2E5VtmMyQV3Sg/viewform?embedded=true" 
                width="640" 
                height="3306" 
                frameBorder={0} 
                marginHeight={0} 
                marginWidth={0}
                title="Partner Application Form"
                className="w-full"
                loading="lazy"
              >
                Loading…
              </iframe>
              <div className="mt-4 text-center">
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSc4hPDQbp-K3IPsmpNsUVG14LdzixrmXsAsN2E5VtmMyQV3Sg/viewform" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-navy/70 text-sm underline hover:text-brand-blue"
                >
                  Having trouble? Open the form in a new tab.
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

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
            <p className="mt-2">While we work through our Beta phase, we charge no direct commission. Reach out to us for more details.</p>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}
