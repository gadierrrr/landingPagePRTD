import React from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { Button } from '../src/ui/Button';
import { SEO } from '../src/ui/SEO';
import Link from 'next/link';

export default function About() {
  return (
    <SiteLayout>
      <SEO 
        title="About Puerto Rico Travel Deals - Your Local Travel Experts"
        description="We're passionate locals who know Puerto Rico's hidden gems. Discover authentic experiences and amazing deals on the island we call home."
      />
      
      {/* Hero Section */}
      <Section tone="brand">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold text-brand-sand">
            PuertoRicoTravelDeals.com
          </div>
          <Heading level={1} className="text-white">
            ¡Hola! We&rsquo;re Your Puerto Rico Travel Experts
          </Heading>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-white/90">
            Born and raised on the island of enchantment, we&rsquo;re here to share the Puerto Rico 
            we know and love&mdash;beyond the tourist brochures.
          </p>
        </div>
      </Section>

      {/* Our Story */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Heading level={2}>Our Story</Heading>
            <div className="mt-6 space-y-4 text-lg">
              <p>
                Picture this: You&rsquo;re planning a trip to Puerto Rico, scrolling through endless 
                generic travel sites that all recommend the same crowded beaches and overpriced 
                restaurants. Sound familiar?
              </p>
              <p className="font-semibold text-brand-navy">
                We&rsquo;ve been there, and we knew there had to be a better way.
              </p>
              <p>
                That&rsquo;s why we created Puerto Rico Travel Deals&mdash;not just another booking site, 
                but your local friends sharing the authentic experiences that make our island special.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-brand-sand p-8">
            <div className="text-center">
              <div className="mb-4 text-6xl">🇵🇷</div>
              <h3 className="text-xl font-bold text-brand-navy">
                100% Puerto Rican Owned
              </h3>
              <p className="text-brand-navy/80 mt-2">
                We live here, we love here, and we know where the real magic happens.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* What Makes Us Different */}
      <Section className="bg-brand-sand">
        <Heading level={2} className="text-center">
          What Makes Us Different
        </Heading>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">🏖️</div>
            <h3 className="mb-3 text-lg font-bold text-brand-navy">Local Insider Knowledge</h3>
            <p className="text-brand-navy/80">
              We don&rsquo;t just Google &ldquo;best restaurants in San Juan&rdquo;&mdash;we know the owner&rsquo;s 
              grandmother&rsquo;s secret mofongo recipe.
            </p>
          </div>
          
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">🤝</div>
            <h3 className="mb-3 text-lg font-bold text-brand-navy">Real Relationships</h3>
            <p className="text-brand-navy/80">
              Every deal comes from authentic partnerships with local businesses we trust 
              and visit ourselves.
            </p>
          </div>
          
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">💝</div>
            <h3 className="mb-3 text-lg font-bold text-brand-navy">Genuine Value</h3>
            <p className="text-brand-navy/80">
              No inflated prices or fake discounts. Just honest deals on experiences 
              worth your vacation time.
            </p>
          </div>
        </div>
      </Section>

      {/* Our Mission */}
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <Heading level={2}>Our Mission</Heading>
          <div className="mt-6 rounded-2xl bg-brand-red p-8 text-white">
            <p className="text-xl leading-relaxed">
              &ldquo;To help travelers discover the Puerto Rico and support the communities that make our island extraordinary.&rdquo;
            </p>
          </div>
        </div>
      </Section>

      {/* Fun Facts */}
      <Section className="bg-brand-sand">
        <Heading level={2} className="text-center">
          Fun Facts About Us
        </Heading>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6">
            <div className="mb-3 text-2xl">🌮</div>
            <p className="text-brand-navy">
              <strong>Tacos or Mofongo?</strong> Mofongo, obviously! Though we respect 
              anyone who chooses tacos. (Just kidding, mofongo wins every time.)
            </p>
          </div>
          
          <div className="rounded-xl bg-white p-6">
            <div className="mb-3 text-2xl">🎵</div>
            <p className="text-brand-navy">
              <strong>Office Playlist:</strong> 50% reggaeton, 30% salsa, 20% whatever 
              keeps us coding through the night. (Yes, we&rsquo;re night owls.)
            </p>
          </div>
          
          <div className="rounded-xl bg-white p-6">
            <div className="mb-3 text-2xl">☕</div>
            <p className="text-brand-navy">
              <strong>Coffee Consumption:</strong> Enough to power a small town. 
              We take our café puertorriqueño very seriously.
            </p>
          </div>
          
          <div className="rounded-xl bg-white p-6">
            <div className="mb-3 text-2xl">🦜</div>
            <p className="text-brand-navy">
              <strong>Team Mascot:</strong> We&rsquo;re still negotiating with the local iguanas. 
              They drive a hard bargain, but they know all the best spots.
            </p>
          </div>
        </div>
      </Section>

      {/* Call to Action */}
      <Section>
        <div className="rounded-2xl bg-brand-blue p-8 text-center text-white sm:p-12">
          <Heading level={2} className="text-white">
            Ready to Explore?
          </Heading>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Check out our handpicked deals and discover your new favorite experience.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/deals">
              <Button className="hover:bg-brand-red/90 bg-brand-red text-white">
                Browse Current Deals
              </Button>
            </Link>
            <Link href="/join">
              <Button className="bg-white text-brand-blue hover:bg-white/90">
                Join Our Community
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* Contact Section */}
      <Section className="bg-brand-sand">
        <div className="text-center">
          <Heading level={2}>Get in Touch</Heading>
          <p className="mx-auto mt-4 max-w-2xl">
            Have questions? Want to share your own Puerto Rico adventures? 
            Or maybe you know a hidden gem we haven&rsquo;t discovered yet?
          </p>
          <div className="mt-6">
            <Link href="/partner">
              <Button>
                Partner with Us
              </Button>
            </Link>
          </div>
          <p className="text-brand-navy/70 mt-4 text-sm">
            We love hearing from fellow Puerto Rico enthusiasts!
          </p>
        </div>
      </Section>
    </SiteLayout>
  );
}