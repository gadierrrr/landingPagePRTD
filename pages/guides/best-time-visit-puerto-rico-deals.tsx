import React from 'react';
import Link from 'next/link';
import { SiteLayout } from '../../src/ui/layout/SiteLayout';
import { Section } from '../../src/ui/Section';
import { Heading } from '../../src/ui/Heading';
import { SEO } from '../../src/ui/SEO';

export default function BestTimeVisitGuide() {
  return (
    <SiteLayout>
      <SEO 
        title="Best Time to Visit Puerto Rico for Travel Deals - Seasonal Savings Guide"
        description="Discover the best times to visit Puerto Rico for maximum travel savings. Learn about seasonal pricing, weather patterns, and exclusive deals throughout the year."
        canonical="https://puertoricotraveldeals.com/guides/best-time-visit-puerto-rico-deals"
        keywords={[
          'Puerto Rico best time to visit',
          'Puerto Rico seasonal deals',
          'when to visit Puerto Rico',
          'Puerto Rico travel seasons',
          'Caribbean travel timing',
          'Puerto Rico weather deals',
          'hurricane season deals',
          'winter escape Puerto Rico'
        ]}
      />
      
      <Section>
        <Heading level={1}>Best Time to Visit Puerto Rico for Travel Deals</Heading>
        <p className="text-brand-navy/70 mt-4 text-lg">
          Maximize your savings with insider knowledge of Puerto Rico's seasonal pricing patterns and deal availability.
        </p>

        <div className="mt-12 space-y-12">
          {/* Peak Season */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              December - April: Peak Season (Highest Prices)
            </Heading>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">What to Expect</h3>
                <ul className="text-brand-navy/80 mt-3 space-y-2">
                  <li>• Perfect weather: 75-85°F with minimal rainfall</li>
                  <li>• Busiest time for mainland US visitors escaping winter</li>
                  <li>• Hotel rates 40-60% higher than off-season</li>
                  <li>• Popular beaches and attractions are crowded</li>
                  <li>• Advanced booking required for best accommodations</li>
                </ul>
              </div>
              <div className="border-brand-navy/10 bg-brand-red/5 rounded-xl border p-6">
                <h3 className="text-lg font-bold text-brand-red">Money-Saving Tips</h3>
                <ul className="text-brand-navy/80 mt-3 space-y-2">
                  <li>• Book accommodations 3-4 months in advance</li>
                  <li>• Consider mid-week stays (Sunday-Thursday)</li>
                  <li>• Look for package deals combining flight + hotel</li>
                  <li>• Explore lesser-known beaches and towns</li>
                  <li>• Book activities directly with local operators</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Shoulder Seasons */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              May & November: Sweet Spot Seasons (Best Value)
            </Heading>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Why These Months Rock</h3>
                <ul className="text-brand-navy/80 mt-3 space-y-2">
                  <li>• Great weather with occasional brief showers</li>
                  <li>• Hotel rates 20-30% lower than peak season</li>
                  <li>• Fewer crowds at popular attractions</li>
                  <li>• Better availability for last-minute bookings</li>
                  <li>• Local festivals and cultural events</li>
                </ul>
              </div>
              <div className="border-brand-navy/10 bg-brand-blue/5 rounded-xl border p-6">
                <h3 className="text-lg font-bold text-brand-blue">Insider Secrets</h3>
                <ul className="text-brand-navy/80 mt-3 space-y-2">
                  <li>• May: Perfect for El Yunque hiking before summer heat</li>
                  <li>• November: Post-hurricane season with cleared-up weather</li>
                  <li>• Book accommodations 6-8 weeks ahead for best rates</li>
                  <li>• Restaurants offer more availability and attention</li>
                  <li>• Ideal for exploring both coast and mountains</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hurricane Season */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              June - October: Hurricane Season (Lowest Prices)
            </Heading>
            <div className="bg-brand-navy/5 mt-6 rounded-xl p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">The Reality Check</h3>
                  <p className="text-brand-navy/80 mt-3">
                    Don't let &quot;hurricane season&quot; scare you away. Actual hurricanes affecting Puerto Rico are relatively rare, 
                    and the island has excellent infrastructure and warning systems. Most days feature normal tropical weather 
                    with afternoon showers.
                  </p>
                  <ul className="text-brand-navy/80 mt-4 space-y-2">
                    <li>• Hotel rates 30-50% lower than peak season</li>
                    <li>• Flight deals are most common</li>
                    <li>• August-September have highest storm probability</li>
                    <li>• Many hotels offer flexible cancellation policies</li>
                  </ul>
                </div>
                <div className="border-brand-navy/10 rounded-xl border bg-brand-sand p-4">
                  <h3 className="text-lg font-bold text-brand-navy">Smart Booking Strategy</h3>
                  <ul className="text-brand-navy/80 mt-3 space-y-2">
                    <li>• Purchase travel insurance for peace of mind</li>
                    <li>• Choose accommodations with flexible policies</li>
                    <li>• Monitor weather 7-10 days before travel</li>
                    <li>• Consider June-July for lower storm risk</li>
                    <li>• Book activities that work in light rain</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              Month-by-Month Deal Calendar
            </Heading>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { month: 'January', price: 'Highest', weather: 'Perfect', crowds: 'Busiest', deals: 'Limited' },
                { month: 'February', price: 'Highest', weather: 'Perfect', crowds: 'Very Busy', deals: 'Limited' },
                { month: 'March', price: 'High', weather: 'Excellent', crowds: 'Busy', deals: 'Some' },
                { month: 'April', price: 'High', weather: 'Great', crowds: 'Moderate', deals: 'Growing' },
                { month: 'May', price: 'Moderate', weather: 'Good', crowds: 'Light', deals: 'Best Value' },
                { month: 'June', price: 'Low', weather: 'Hot/Humid', crowds: 'Light', deals: 'Excellent' },
                { month: 'July', price: 'Low', weather: 'Hot/Humid', crowds: 'Moderate', deals: 'Great' },
                { month: 'August', price: 'Lowest', weather: 'Hot/Rainy', crowds: 'Light', deals: 'Maximum' },
                { month: 'September', price: 'Lowest', weather: 'Hot/Rainy', crowds: 'Light', deals: 'Maximum' },
                { month: 'October', price: 'Low', weather: 'Improving', crowds: 'Light', deals: 'Excellent' },
                { month: 'November', price: 'Moderate', weather: 'Good', crowds: 'Light', deals: 'Best Value' },
                { month: 'December', price: 'High', weather: 'Great', crowds: 'Growing', deals: 'Limited' }
              ].map((month, index) => (
                <div key={index} className="border-brand-navy/10 rounded-lg border bg-white p-4">
                  <h3 className="font-bold text-brand-navy">{month.month}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="text-brand-navy/70">
                      <span className="font-medium">Price:</span> {month.price}
                    </div>
                    <div className="text-brand-navy/70">
                      <span className="font-medium">Weather:</span> {month.weather}
                    </div>
                    <div className="text-brand-navy/70">
                      <span className="font-medium">Crowds:</span> {month.crowds}
                    </div>
                    <div className="font-medium text-brand-blue">
                      Deals: {month.deals}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Events */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              Events That Impact Pricing
            </Heading>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-lg font-bold text-brand-red">High Demand Periods (Book Early)</h3>
                <ul className="text-brand-navy/80 mt-4 space-y-2">
                  <li>• <strong>Christmas & New Year:</strong> Dec 20 - Jan 5</li>
                  <li>• <strong>Easter Week:</strong> March/April (varies yearly)</li>
                  <li>• <strong>San Sebastián Festival:</strong> Mid-January in Old San Juan</li>
                  <li>• <strong>Spring Break:</strong> March-April (US college schedules)</li>
                  <li>• <strong>Casals Festival:</strong> February-March (classical music)</li>
                </ul>
              </div>
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-lg font-bold text-brand-blue">Deal Opportunities</h3>
                <ul className="text-brand-navy/80 mt-4 space-y-2">
                  <li>• <strong>Back to School:</strong> Late August deals for September travel</li>
                  <li>• <strong>Hurricane Season Specials:</strong> June-November flash sales</li>
                  <li>• <strong>Thanksgiving Week:</strong> Surprisingly good hotel rates</li>
                  <li>• <strong>Early December:</strong> Pre-holiday pricing dip</li>
                  <li>• <strong>Post-New Year:</strong> January 6-15 recovery period</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="border-brand-navy/10 bg-brand-blue/5 rounded-2xl border p-8 text-center">
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              Ready to Find Your Perfect Puerto Rico Deal?
            </Heading>
            <p className="text-brand-navy/70 mx-auto mt-4 max-w-2xl">
              Now that you know the best times to visit, browse our curated deals to find the perfect 
              Puerto Rico experience at the right price for your travel window.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link 
                href="/deals" 
                className="hover:bg-brand-blue/90 inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3 font-bold text-white shadow"
              >
                View Current Deals ➜
              </Link>
              <Link 
                href="/join" 
                className="hover:bg-brand-navy/90 inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-bold text-white shadow"
              >
                Get Deal Alerts ➜
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}