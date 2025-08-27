import React from 'react';
import Link from 'next/link';
import { SiteLayout } from '../../src/ui/layout/SiteLayout';
import { Section } from '../../src/ui/Section';
import { Heading } from '../../src/ui/Heading';
import { SEO } from '../../src/ui/SEO';

export default function AuthenticExperiencesGuide() {
  return (
    <SiteLayout>
      <SEO 
        title="Authentic Puerto Rico Experiences - Local Guide to Real Culture"
        description="Discover authentic Puerto Rico beyond tourist attractions. Local insider guide to real cultural experiences, hidden gems, and traditional activities."
        canonical="https://puertoricotraveldeals.com/guides/authentic-puerto-rico-experiences"
        keywords={[
          'authentic Puerto Rico experiences',
          'Puerto Rico local culture',
          'real Puerto Rico activities',
          'Puerto Rico hidden gems',
          'local Puerto Rico guide',
          'traditional Puerto Rico',
          'off the beaten path Puerto Rico',
          'Puerto Rican culture immersion'
        ]}
      />
      
      <Section>
        <Heading level={1}>Authentic Puerto Rico Experiences</Heading>
        <p className="text-brand-navy/70 mt-4 text-lg">
          Go beyond the tourist trail and discover the real Puerto Rico through the eyes of locals. 
          These authentic experiences showcase our island&apos;s true spirit, culture, and traditions.
        </p>

        <div className="mt-12 space-y-12">
          {/* What Makes An Experience Authentic */}
          <div className="border-brand-navy/10 bg-brand-sand/20 rounded-2xl border p-8">
            <Heading level={2} className="text-center text-2xl font-black text-brand-navy">
              What Makes a Puerto Rico Experience Truly Authentic?
            </Heading>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 text-4xl">🏠</div>
                <h3 className="text-lg font-bold text-brand-navy">Local Ownership</h3>
                <p className="text-brand-navy/70 mt-2 text-sm">
                  Family-owned businesses passed down through generations, where stories and traditions 
                  are shared alongside incredible food and experiences.
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 text-4xl">🗣️</div>
                <h3 className="text-lg font-bold text-brand-navy">Cultural Context</h3>
                <p className="text-brand-navy/70 mt-2 text-sm">
                  Understanding the &quot;why&quot; behind traditions, from the Taíno influences in our cuisine 
                  to the African rhythms in our music.
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 text-4xl">🌱</div>
                <h3 className="text-lg font-bold text-brand-navy">Community Impact</h3>
                <p className="text-brand-navy/70 mt-2 text-sm">
                  Experiences that give back to local communities and preserve traditions for 
                  future generations of Puerto Ricans.
                </p>
              </div>
            </div>
          </div>

          {/* Food & Culinary */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              🍽️ Authentic Culinary Experiences
            </Heading>
            
            <div className="mt-8 space-y-6">
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">Cook with Abuela: Traditional Family Recipes</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-brand-navy/80 leading-relaxed">
                      Learn to make authentic mofongo, pasteles, and sofrito from Puerto Rican grandmothers 
                      in their own kitchens. These aren't restaurant versions – they're the recipes passed 
                      down through families for generations. You'll hear stories about each ingredient's 
                      significance while learning techniques you can't get from any cookbook.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Hands-on cooking', 'Family stories', 'Recipe cards to take home', '3-course meal'].map(feature => (
                        <span key={feature} className="bg-brand-blue/10 rounded-full px-3 py-1 text-sm font-medium text-brand-blue">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-sand/50 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy">What Makes It Special</h4>
                    <ul className="text-brand-navy/70 mt-2 space-y-1 text-sm">
                      <li>• Home kitchens, not commercial spaces</li>
                      <li>• Multi-generational family participation</li>
                      <li>• Stories behind each dish's origin</li>
                      <li>• Techniques refined over decades</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">Farm-to-Table in the Mountains</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-brand-navy/80 leading-relaxed">
                      Visit working coffee farms in the central mountains where families have been growing 
                      beans for over a century. Pick coffee cherries, learn traditional roasting methods, 
                      and enjoy lunch made entirely from ingredients grown on the property – from plantains 
                      and yuca to herbs and spices.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Coffee farm tour', 'Harvest participation', 'Traditional roasting', 'Farm lunch'].map(feature => (
                        <span key={feature} className="bg-brand-red/10 rounded-full px-3 py-1 text-sm font-medium text-brand-red">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-sand/50 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy">Seasonal Highlights</h4>
                    <ul className="text-brand-navy/70 mt-2 space-y-1 text-sm">
                      <li>• Coffee harvest: Sep-Feb</li>
                      <li>• Plantain season: Year-round</li>
                      <li>• Mango season: May-Aug</li>
                      <li>• Best weather: Dec-Apr</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">Chinchorreo: The Art of Bar Hopping, Puerto Rican Style</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-brand-navy/80 leading-relaxed">
                      "Chinchorreo" is more than bar hopping – it's a cultural institution. Visit authentic 
                      chinchorros (local bars) where locals gather to play dominoes, discuss politics, and 
                      enjoy cold beers with traditional bar snacks like alcapurrias and bacalaitos. 
                      Each stop has its own personality and regulars who'll share island gossip.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Local bars only', 'Traditional snacks', 'Domino games', 'Cultural immersion'].map(feature => (
                        <span key={feature} className="bg-brand-navy/10 rounded-full px-3 py-1 text-sm font-medium text-brand-navy">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-sand/50 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy">Chinchorreo Etiquette</h4>
                    <ul className="text-brand-navy/70 mt-2 space-y-1 text-sm">
                      <li>• Always greet everyone when entering</li>
                      <li>• Don't rush between stops</li>
                      <li>• Ask before joining domino games</li>
                      <li>• Tip bartenders generously</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Arts & Culture */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              🎨 Arts, Music & Cultural Immersion
            </Heading>
            
            <div className="mt-8 space-y-6">
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">Bomba & Plena: The Heartbeat of Puerto Rico</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-brand-navy/80 leading-relaxed">
                      These aren't performances for tourists – they're community gatherings where music, 
                      dance, and storytelling merge into one powerful cultural expression. Bomba's call-and-response 
                      between drummer and dancer tells stories of resistance and resilience, while plena 
                      serves as the island's musical newspaper, chronicling daily life and social issues.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Community participation', 'Live music', 'Dance lessons', 'Historical context'].map(feature => (
                        <span key={feature} className="bg-brand-blue/10 rounded-full px-3 py-1 text-sm font-medium text-brand-blue">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-sand/50 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy">Where to Experience</h4>
                    <ul className="text-brand-navy/70 mt-2 space-y-1 text-sm">
                      <li>• Villa Palmeras community center</li>
                      <li>• Santurce cultural events</li>
                      <li>• Loíza traditional celebrations</li>
                      <li>• Weekend plaza gatherings</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">Traditional Craft Workshops</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-brand-navy/80 leading-relaxed">
                      Learn traditional Puerto Rican crafts from master artisans whose families have 
                      practiced these arts for generations. Create your own santos (religious wood carvings), 
                      weave with traditional techniques, or learn to make musical instruments like cuatros 
                      and maracas. Each workshop includes the cultural and historical context of the craft.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Master artisans', 'Take home your creation', 'Cultural history', 'Small groups'].map(feature => (
                        <span key={feature} className="bg-brand-red/10 rounded-full px-3 py-1 text-sm font-medium text-brand-red">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-sand/50 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy">Popular Crafts</h4>
                    <ul className="text-brand-navy/70 mt-2 space-y-1 text-sm">
                      <li>• Santos carving (religious art)</li>
                      <li>• Traditional basket weaving</li>
                      <li>• Cuatro (guitar) making</li>
                      <li>• Vejigante mask creation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nature & Adventure */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              🌿 Nature & Adventure with Local Wisdom
            </Heading>
            
            <div className="mt-8 space-y-6">
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">El Yunque with a Local Naturalist</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-brand-navy/80 leading-relaxed">
                      Skip the crowded tourist trails and explore El Yunque with local naturalists who 
                      grew up in the rainforest's shadow. Learn about medicinal plants their grandparents 
                      used, spot endemic species like the Puerto Rican parrot, and hear Taíno legends 
                      about the forest spirits. These guides know secret swimming holes and viewpoints 
                      that most visitors never see.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Secret trails', 'Medicinal plant knowledge', 'Endemic wildlife', 'Taíno stories'].map(feature => (
                        <span key={feature} className="bg-brand-blue/10 rounded-full px-3 py-1 text-sm font-medium text-brand-blue">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-sand/50 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy">Local Knowledge</h4>
                    <ul className="text-brand-navy/70 mt-2 space-y-1 text-sm">
                      <li>• Traditional plant medicine</li>
                      <li>• Weather pattern reading</li>
                      <li>• Wildlife behavior insights</li>
                      <li>• Safe swimming spots</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">Traditional Fishing with Local Fishermen</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-brand-navy/80 leading-relaxed">
                      Join local fishermen who've been working these waters for decades. Learn traditional 
                      techniques passed down through generations, understand seasonal patterns, and hear 
                      stories about how Hurricane María changed the island's relationship with the ocean. 
                      The day ends with cooking your catch using traditional methods on the beach.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Traditional techniques', 'Local wisdom', 'Beach cooking', 'Ocean stories'].map(feature => (
                        <span key={feature} className="bg-brand-navy/10 rounded-full px-3 py-1 text-sm font-medium text-brand-navy">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-sand/50 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy">Best Fishing Seasons</h4>
                    <ul className="text-brand-navy/70 mt-2 space-y-1 text-sm">
                      <li>• Mahi-mahi: Apr-Jul</li>
                      <li>• Yellowfin tuna: Year-round</li>
                      <li>• Snapper: Sep-Mar</li>
                      <li>• Marlin: May-Sep</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community & Spiritual */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              🏛️ Community & Spiritual Experiences
            </Heading>
            
            <div className="mt-8 space-y-6">
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">Attend a Traditional Velorio (Wake)</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-brand-navy/80 leading-relaxed">
                      In Puerto Rico, death is honored with celebration as much as mourning. Traditional 
                      velorios feature live música jíbara, storytelling, and community gathering that 
                      can last all night. While you wouldn't attend an actual funeral, cultural centers 
                      sometimes recreate these traditions to preserve and share this important aspect 
                      of Puerto Rican culture.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Cultural preservation', 'Live folk music', 'Community stories', 'Spiritual traditions'].map(feature => (
                        <span key={feature} className="bg-brand-red/10 rounded-full px-3 py-1 text-sm font-medium text-brand-red">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-sand/50 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy">Cultural Elements</h4>
                    <ul className="text-brand-navy/70 mt-2 space-y-1 text-sm">
                      <li>• Música jíbara performances</li>
                      <li>• Traditional food preparation</li>
                      <li>• Storytelling and testimonials</li>
                      <li>• Community bonding rituals</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-xl font-bold text-brand-navy">Participate in a Traditional Rosario</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <p className="text-brand-navy/80 leading-relaxed">
                      These community prayer gatherings blend Catholic traditions with indigenous and 
                      African spiritual practices. Participants share personal intentions, sing traditional 
                      hymns, and create a sense of community that extends far beyond religious boundaries. 
                      The evening often ends with sharing homemade sweets and coffee.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Community prayer', 'Cultural fusion', 'Traditional hymns', 'Social bonding'].map(feature => (
                        <span key={feature} className="bg-brand-blue/10 rounded-full px-3 py-1 text-sm font-medium text-brand-blue">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-brand-sand/50 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy">When to Join</h4>
                    <ul className="text-brand-navy/70 mt-2 space-y-1 text-sm">
                      <li>• December: Las Posadas</li>
                      <li>• May: Rosarios de Mayo</li>
                      <li>• Holy Week celebrations</li>
                      <li>• Community feast days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to Find Authentic Experiences */}
          <div>
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              🔍 How to Find These Authentic Experiences
            </Heading>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-lg font-bold text-brand-red">❌ Tourist Trap Warning Signs</h3>
                <ul className="text-brand-navy/80 mt-4 space-y-2">
                  <li>• Large group sizes (15+ people)</li>
                  <li>• Performances that feel staged</li>
                  <li>• No interaction with actual locals</li>
                  <li>• Located inside resort properties</li>
                  <li>• Same price for everyone, no negotiation</li>
                  <li>• Guides who don't speak Spanish fluently</li>
                  <li>• Heavy focus on photo opportunities</li>
                </ul>
              </div>
              <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                <h3 className="text-lg font-bold text-brand-blue">✅ Authentic Experience Markers</h3>
                <ul className="text-brand-navy/80 mt-4 space-y-2">
                  <li>• Small groups (2-8 people max)</li>
                  <li>• Local family involvement</li>
                  <li>• Cultural context and stories</li>
                  <li>• Takes place in actual communities</li>
                  <li>• Supports local businesses directly</li>
                  <li>• Native Spanish speakers as guides</li>
                  <li>• Focus on learning and connection</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="border-brand-navy/10 bg-brand-blue/5 rounded-2xl border p-8 text-center">
            <Heading level={2} className="text-2xl font-black text-brand-navy">
              Ready to Experience the Real Puerto Rico?
            </Heading>
            <p className="text-brand-navy/70 mx-auto mt-4 max-w-2xl">
              PRTD specializes in connecting travelers with authentic Puerto Rican experiences. 
              Our local partnerships ensure you'll discover the island's true culture, not just its tourist attractions.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link 
                href="/deals?category=activity" 
                className="hover:bg-brand-blue/90 inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3 font-bold text-white shadow"
              >
                Browse Cultural Experiences ➜
              </Link>
              <Link 
                href="/join" 
                className="hover:bg-brand-navy/90 inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-bold text-white shadow"
              >
                Get Local Recommendations ➜
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}