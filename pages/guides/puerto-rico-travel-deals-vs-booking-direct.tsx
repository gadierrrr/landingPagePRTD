import React from 'react';
import Link from 'next/link';
import { SiteLayout } from '../../src/ui/layout/SiteLayout';
import { Section } from '../../src/ui/Section';
import { Heading } from '../../src/ui/Heading';
import { SEO } from '../../src/ui/SEO';

export default function DealsVsDirectBookingGuide() {
  return (
    <SiteLayout>
      <SEO 
        title="Puerto Rico Travel Deals vs Booking Direct - Which Saves More Money?"
        description="Compare Puerto Rico travel deals with direct booking. Learn when to use deal sites vs booking directly with hotels and activities for maximum savings."
        canonical="https://puertoricotraveldeals.com/guides/puerto-rico-travel-deals-vs-booking-direct"
        keywords={[
          'Puerto Rico travel deals vs direct booking',
          'best way to book Puerto Rico',
          'Puerto Rico hotel booking comparison',
          'direct booking vs deal sites',
          'Puerto Rico travel savings',
          'how to book Puerto Rico cheaply',
          'travel deal sites comparison',
          'Puerto Rico booking tips'
        ]}
      />
      
      <Section>
        <Heading level={1}>Puerto Rico Travel Deals vs Booking Direct</Heading>
        <p className="text-brand-navy/70 mt-4 text-lg">
          Discover when to use deal platforms like PRTD versus booking directly with hotels and activity providers 
          to maximize your Puerto Rico travel savings.
        </p>

        <div className="mt-12 space-y-12">
          {/* Quick Comparison */}
          <div className="border-brand-navy/10 rounded-2xl border bg-white p-8">
            <Heading level={2} className="text-center text-2xl font-black text-brand-navy">
              Quick Decision Matrix
            </Heading>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="bg-brand-blue/5 rounded-xl p-6">
                <h3 className="text-xl font-bold text-brand-blue">Choose Deal Platforms When:</h3>
                <ul className="text-brand-navy/80 mt-4 space-y-2">
                  <li>✓ You want pre-vetted, authentic experiences</li>
                  <li>✓ You're looking for package deals and bundles</li>
                  <li>✓ You need local insider knowledge</li>
                  <li>✓ You're traveling during peak season</li>
                  <li>✓ You want to discover hidden gems</li>
                  <li>✓ You prefer curated options over endless choices</li>
                </ul>
              </div>
              <div className="bg-brand-red/5 rounded-xl p-6">
                <h3 className="text-xl font-bold text-brand-red">Book Direct When:</h3>
                <ul className="text-brand-navy/80 mt-4 space-y-2">
                  <li>✓ You have specific loyalty program preferences</li>
                  <li>✓ You need maximum flexibility for changes</li>
                  <li>✓ You're booking luxury accommodations</li>
                  <li>✓ You want to build direct relationships</li>
                  <li>✓ You're planning extended stays (7+ days)</li>
                  <li>✓ You have very specific requirements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* PRTD Advantage */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              The PRTD Advantage: Local Curation Meets Real Savings
            </Heading>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <div className="mb-4 text-3xl">🏝️</div>
                <h3 className="text-lg font-bold text-brand-navy">100% Puerto Rican Owned</h3>
                <p className="text-brand-navy/70 mt-2">
                  We live here, we know the island's hidden gems, and we personally vet every deal. 
                  You get authentic local experiences, not tourist traps.
                </p>
              </div>
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <div className="mb-4 text-3xl">🤝</div>
                <h3 className="text-lg font-bold text-brand-navy">Direct Partner Relationships</h3>
                <p className="text-brand-navy/70 mt-2">
                  Our partnerships with local businesses mean exclusive deals you can't find anywhere else, 
                  plus insider perks and personalized service.
                </p>
              </div>
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <div className="mb-4 text-3xl">💡</div>
                <h3 className="text-lg font-bold text-brand-navy">Curated Discovery</h3>
                <p className="text-brand-navy/70 mt-2">
                  Instead of overwhelming you with thousands of options, we handpick the best deals 
                  based on quality, value, and authentic Puerto Rican experience.
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              Category-by-Category Comparison
            </Heading>
            
            <div className="mt-8 space-y-8">
              {/* Hotels */}
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">🏨 Hotels & Accommodations</h3>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="font-bold text-brand-blue">PRTD Hotel Deals</h4>
                    <ul className="text-brand-navy/80 mt-3 space-y-1 text-sm">
                      <li>• Exclusive packages with local perks</li>
                      <li>• Vetted properties with authentic character</li>
                      <li>• Bundle deals with activities and dining</li>
                      <li>• Local knowledge about best room types</li>
                      <li>• Average savings: 25-40% vs rack rates</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-red">Direct Hotel Booking</h4>
                    <ul className="text-brand-navy/80 mt-3 space-y-1 text-sm">
                      <li>• Loyalty points and elite benefits</li>
                      <li>• Most flexible cancellation policies</li>
                      <li>• Room upgrades and late checkout</li>
                      <li>• Direct customer service relationship</li>
                      <li>• Best for luxury properties and chains</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-brand-sand/30 mt-4 rounded-lg p-4">
                  <p className="text-brand-navy/80 text-sm">
                    <strong>Pro Tip:</strong> For boutique hotels and local gems, PRTD often has better rates and insider perks. 
                    For international chains where you have loyalty status, book direct after checking our deals for comparison.
                  </p>
                </div>
              </div>

              {/* Activities */}
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">🏄‍♂️ Activities & Adventures</h3>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="font-bold text-brand-blue">PRTD Activity Deals</h4>
                    <ul className="text-brand-navy/80 mt-3 space-y-1 text-sm">
                      <li>• Pre-vetted operators with safety records</li>
                      <li>• Local guides who speak fluent English</li>
                      <li>• Combination packages for multiple activities</li>
                      <li>• Insider access to less crowded experiences</li>
                      <li>• Average savings: 30-50% vs walk-up rates</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-red">Direct Activity Booking</h4>
                    <ul className="text-brand-navy/80 mt-3 space-y-1 text-sm">
                      <li>• Maximum scheduling flexibility</li>
                      <li>• Direct communication with operators</li>
                      <li>• Custom group arrangements</li>
                      <li>• Sometimes lower prices for locals</li>
                      <li>• Good for repeat visitors with preferences</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-brand-sand/30 mt-4 rounded-lg p-4">
                  <p className="text-brand-navy/80 text-sm">
                    <strong>Pro Tip:</strong> Activities are where deal platforms shine brightest. Local operators often offer 
                    significant discounts through trusted partners like PRTD to fill capacity during slower periods.
                  </p>
                </div>
              </div>

              {/* Dining */}
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">🍽️ Dining & Restaurants</h3>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="font-bold text-brand-blue">PRTD Restaurant Deals</h4>
                    <ul className="text-brand-navy/80 mt-3 space-y-1 text-sm">
                      <li>• Access to family-owned hidden gems</li>
                      <li>• Prix fixe menus at top restaurants</li>
                      <li>• Cultural dining experiences with stories</li>
                      <li>• Off-menu items and chef specials</li>
                      <li>• Average savings: 20-35% vs à la carte</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-red">Direct Restaurant Booking</h4>
                    <ul className="text-brand-navy/80 mt-3 space-y-1 text-sm">
                      <li>• Full menu flexibility and customization</li>
                      <li>• Easy special dietary accommodations</li>
                      <li>• Direct relationship with service staff</li>
                      <li>• Spontaneous dining decisions</li>
                      <li>• Better for fine dining experiences</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-brand-sand/30 mt-4 rounded-lg p-4">
                  <p className="text-brand-navy/80 text-sm">
                    <strong>Pro Tip:</strong> Use PRTD to discover authentic local restaurants you'd never find otherwise, 
                    then return to book direct for special occasions or when you want to become a regular.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Real Savings Breakdown */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              Real Money: Side-by-Side Savings Analysis
            </Heading>
            <div className="bg-brand-navy/5 mt-6 rounded-2xl p-8">
              <h3 className="text-center text-lg font-bold text-brand-navy">
                Sample 4-Day Puerto Rico Trip Cost Comparison
              </h3>
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl bg-white p-6">
                  <h4 className="text-center font-bold text-brand-red">Booking Everything Direct</h4>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hotel (3 nights):</span>
                      <span>$450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>El Yunque Tour:</span>
                      <span>$85</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bioluminescent Kayak:</span>
                      <span>$65</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2 Restaurant Dinners:</span>
                      <span>$160</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Snorkeling Trip:</span>
                      <span>$75</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>$835</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-6">
                  <h4 className="text-center font-bold text-brand-blue">Using PRTD Deals</h4>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hotel Package:</span>
                      <span className="text-brand-navy/50 line-through">$450</span>
                      <span className="font-bold text-brand-blue">$315</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Adventure Bundle:</span>
                      <span className="text-brand-navy/50 line-through">$150</span>
                      <span className="font-bold text-brand-blue">$95</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Snorkeling Deal:</span>
                      <span className="text-brand-navy/50 line-through">$75</span>
                      <span className="font-bold text-brand-blue">$45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Local Dining:</span>
                      <span className="text-brand-navy/50 line-through">$160</span>
                      <span className="font-bold text-brand-blue">$110</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus Beach Access:</span>
                      <span className="font-bold text-brand-blue">Free</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-brand-blue">$565</span>
                    </div>
                    <div className="text-center font-bold text-brand-blue">
                      Save $270 (32%)
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-6">
                  <h4 className="text-center font-bold text-brand-navy">Hybrid Approach</h4>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hotel (direct loyalty):</span>
                      <span>$400</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PRTD Activity Bundle:</span>
                      <span className="font-bold text-brand-blue">$95</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PRTD Snorkeling:</span>
                      <span className="font-bold text-brand-blue">$45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1 Direct + 1 Deal Dinner:</span>
                      <span>$135</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plus: Room upgrade:</span>
                      <span className="font-bold text-green-600">Free</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>$675</span>
                    </div>
                    <div className="text-center font-bold text-brand-navy">
                      Save $160 (19%) + perks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* When NOT to Use Deals */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              When Direct Booking Makes More Sense
            </Heading>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="border-brand-navy/10 bg-brand-red/5 rounded-xl border p-6">
                <h3 className="text-lg font-bold text-brand-red">Situations Favoring Direct Booking</h3>
                <ul className="text-brand-navy/80 mt-4 space-y-3">
                  <li>
                    <strong>Business Travel:</strong> You need maximum flexibility for changes and 
                    expense account compatibility
                  </li>
                  <li>
                    <strong>Loyalty Status:</strong> You have high-tier status with hotel chains that 
                    provides valuable perks
                  </li>
                  <li>
                    <strong>Group Events:</strong> Planning weddings, corporate retreats, or large 
                    family gatherings
                  </li>
                  <li>
                    <strong>Luxury Experiences:</strong> High-end resorts often reserve their best 
                    amenities for direct bookings
                  </li>
                  <li>
                    <strong>Special Needs:</strong> You have specific accessibility or dietary 
                    requirements that need direct coordination
                  </li>
                </ul>
              </div>
              <div className="border-brand-navy/10 bg-brand-blue/5 rounded-xl border p-6">
                <h3 className="text-lg font-bold text-brand-blue">The PRTD Sweet Spot</h3>
                <ul className="text-brand-navy/80 mt-4 space-y-3">
                  <li>
                    <strong>First-Time Visitors:</strong> Let us guide you to authentic experiences 
                    you'd never find alone
                  </li>
                  <li>
                    <strong>Adventure Seekers:</strong> We specialize in outdoor activities and 
                    unique island experiences
                  </li>
                  <li>
                    <strong>Cultural Travelers:</strong> Connect with real Puerto Rican culture 
                    through our local partnerships
                  </li>
                  <li>
                    <strong>Budget-Conscious:</strong> Maximize your vacation value without sacrificing 
                    quality or authenticity
                  </li>
                  <li>
                    <strong>Spontaneous Travelers:</strong> Last-minute deals and flexible packages 
                    for when inspiration strikes
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="border-brand-navy/10 bg-brand-blue/5 rounded-2xl border p-8 text-center">
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              Ready to Experience the PRTD Difference?
            </Heading>
            <p className="text-brand-navy/70 mx-auto mt-4 max-w-2xl">
              Browse our handpicked deals and discover why thousands of travelers choose PRTD for 
              authentic Puerto Rican experiences at unbeatable prices.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link 
                href="/deals" 
                className="hover:bg-brand-blue/90 inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3 font-bold text-white shadow"
              >
                Browse Current Deals ➜
              </Link>
              <Link 
                href="/partner" 
                className="hover:bg-brand-navy/90 inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-bold text-white shadow"
              >
                Partner With Us ➜
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}