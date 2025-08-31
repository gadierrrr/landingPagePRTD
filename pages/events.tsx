import React from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';
import { PublicEventsGrid } from '../src/ui/events/PublicEventsGrid';
import { WeeklyEvents, EventsIndex } from '../src/lib/forms';
import { readWeeklyEvents, readEventsIndex, getCurrentWeekStart } from '../src/lib/eventsStore';
import { generateEventSeriesStructuredData } from '../src/lib/seo';

interface EventsPageProps {
  weeklyEvents: WeeklyEvents;
  eventsIndex: EventsIndex;
  currentWeekStart: string;
}

export default function EventsPage({ weeklyEvents, eventsIndex, currentWeekStart }: EventsPageProps) {
  // Generate structured data for current week
  const eventSeriesSchema = generateEventSeriesStructuredData(weeklyEvents.events, currentWeekStart);
  
  const availableWeeks = eventsIndex.weeks
    .filter(week => week.eventCount > 0)
    .sort((a, b) => b.startDate.localeCompare(a.startDate)) // Most recent first
    .slice(0, 8); // Show max 8 weeks

  return (
    <>
      <SEO 
        title="Weekly Events in Puerto Rico - Live Music, Food & Culture"
        description="Discover the best weekly events happening across Puerto Rico. Live music, cultural festivals, food events, and more. Updated every Monday."
        keywords={['Puerto Rico events', 'weekly events', 'live music', 'food festivals', 'cultural events', 'nightlife', 'San Juan events']}
        canonical="https://puertoricotraveldeals.com/events"
      />
      
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(eventSeriesSchema, null, 2)
          }}
        />
      </Head>
      
      <SiteLayout>
        <Section>
          <div className="mb-8 text-center">
            <Heading level={1}>Weekly Events</Heading>
            <p className="text-brand-navy/70 mx-auto mt-4 max-w-2xl">
              Discover the best events happening across Puerto Rico this week. 
              From live music and cultural festivals to food events and nightlife.
            </p>
          </div>

          {/* Current Week Events */}
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand-navy">
                This Week ({new Date(currentWeekStart).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })})
              </h2>
              
              {weeklyEvents.events.length > 0 && (
                <Link 
                  href={`/events/week/${currentWeekStart}`}
                  className="text-sm font-medium text-brand-blue transition-colors hover:text-brand-navy"
                >
                  View full week →
                </Link>
              )}
            </div>

            <PublicEventsGrid 
              events={weeklyEvents.events}
              weekStart={currentWeekStart}
              showFilters={true}
            />
          </div>

          {/* Other Available Weeks */}
          {availableWeeks.length > 1 && (
            <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-brand-navy">Other Weeks</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableWeeks
                  .filter(week => week.startDate !== currentWeekStart)
                  .map(week => (
                    <Link
                      key={week.startDate}
                      href={`/events/week/${week.startDate}`}
                      className="border-brand-navy/10 hover:bg-brand-blue/5 block rounded-lg border p-4 transition-all hover:border-brand-blue"
                    >
                      <div className="font-medium text-brand-navy">
                        Week of {new Date(week.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-brand-navy/60 mt-1 text-sm">
                        {week.eventCount} events
                      </div>
                      <div className="text-brand-navy/50 mt-1 text-xs">
                        {week.cities.slice(0, 3).join(', ')}
                        {week.cities.length > 3 && ` +${week.cities.length - 3} more`}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Embed Widget Info */}
          <div className="border-brand-navy/10 bg-brand-sand/30 mt-12 rounded-xl border p-6">
            <h3 className="mb-4 text-lg font-semibold text-brand-navy">Embed Events</h3>
            <p className="text-brand-navy/70 mb-4 text-sm">
              Add Puerto Rico events to your website with this simple embed code:
            </p>
            <div className="bg-brand-navy/5 rounded-lg p-4 font-mono text-sm">
              <div className="text-brand-navy/80">
                {`<div data-prtd-events data-city="San Juan" data-genre="music" data-limit="3"></div>`}
              </div>
              <div className="text-brand-navy/80">
                {`<script async src="https://puertoricotraveldeals.com/embed/events.js"></script>`}
              </div>
            </div>
            <div className="text-brand-navy/60 mt-2 text-xs">
              Customize with data-city, data-genre, and data-limit attributes.
            </div>
          </div>
        </Section>
      </SiteLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps<EventsPageProps> = async () => {
  try {
    const currentWeekStart = await getCurrentWeekStart();
    const weeklyEvents = await readWeeklyEvents(currentWeekStart);
    const eventsIndex = await readEventsIndex();
    
    return {
      props: {
        weeklyEvents,
        eventsIndex,
        currentWeekStart
      },
      revalidate: 3600 // Revalidate every hour (matching deals pattern)
    };
  } catch (error) {
    console.error('Error fetching events for landing page:', error);
    
    return {
      props: {
        weeklyEvents: { weekStartDate: await getCurrentWeekStart(), events: [] },
        eventsIndex: { weeks: [] },
        currentWeekStart: await getCurrentWeekStart()
      },
      revalidate: 60 // Retry more frequently on error
    };
  }
};