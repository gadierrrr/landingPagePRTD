import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { SiteLayout } from '../../../src/ui/layout/SiteLayout';
import { Section } from '../../../src/ui/Section';
import { Heading } from '../../../src/ui/Heading';
import { SEO } from '../../../src/ui/SEO';
import { PublicEventsGrid } from '../../../src/ui/events/PublicEventsGrid';
import { WeeklyEvents } from '../../../src/lib/forms';
import { readWeeklyEvents, readEventsIndex } from '../../../src/lib/eventsStore';
import { getWeeklyEvents, getEventsIndex } from '../../../src/lib/eventsRepo';
import { isSqliteEnabled } from '../../../src/lib/dataSource';
import { generateEventSeriesStructuredData } from '../../../src/lib/seo';

interface WeekPageProps {
  weeklyEvents: WeeklyEvents;
  weekStart: string;
  navigation: {
    prev: string | null;
    next: string | null;
  };
}

export default function WeekPage({ weeklyEvents, weekStart, navigation }: WeekPageProps) {
  // Generate structured data for this week
  const eventSeriesSchema = generateEventSeriesStructuredData(weeklyEvents.events, weekStart);
  
  const weekDate = new Date(weekStart);
  const weekLabel = weekDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEndLabel = weekEndDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });

  const uniqueCities = [...new Set(weeklyEvents.events.map(e => e.city))];
  const uniqueGenres = [...new Set(weeklyEvents.events.map(e => e.genre))];

  return (
    <>
      <SEO 
        title={`Puerto Rico Events - Week of ${weekLabel}`}
        description={`Discover ${weeklyEvents.events.length} events happening in Puerto Rico during the week of ${weekLabel}. ${uniqueGenres.slice(0, 3).join(', ')} and more across ${uniqueCities.slice(0, 3).join(', ')}.`}
        keywords={[
          'Puerto Rico events',
          `events week ${weekLabel}`,
          ...uniqueCities.slice(0, 3),
          ...uniqueGenres.slice(0, 3),
          'weekly events',
          'Puerto Rico calendar'
        ]}
        canonical={`https://puertoricotraveldeals.com/events/week/${weekStart}`}
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
        {/* Breadcrumb */}
        <nav className="border-brand-navy/10 border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/events" className="text-brand-blue transition-colors hover:text-brand-navy">
                Events
              </Link>
              <span className="text-brand-navy/50">•</span>
              <span className="text-brand-navy/70">Week of {weekLabel}</span>
            </div>
          </div>
        </nav>

        <Section>
          <div className="mb-8">
            <Heading level={1}>
              Events: {weekLabel} - {weekEndLabel}
            </Heading>
            <p className="text-brand-navy/70 mt-2">
              {weeklyEvents.events.length} events across {uniqueCities.length} cities
            </p>
          </div>

          {/* Week Navigation */}
          {(navigation.prev || navigation.next) && (
            <div className="mb-8 flex justify-between">
              <div>
                {navigation.prev && (
                  <Link
                    href={`/events/week/${navigation.prev}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue transition-colors hover:text-brand-navy"
                  >
                    ← Previous Week
                  </Link>
                )}
              </div>
              <div>
                {navigation.next && (
                  <Link
                    href={`/events/week/${navigation.next}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue transition-colors hover:text-brand-navy"
                  >
                    Next Week →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Events Grid with Filters */}
          <PublicEventsGrid 
            events={weeklyEvents.events}
            weekStart={weekStart}
            showFilters={true}
          />

          {/* Back to Events */}
          <div className="mt-12 text-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-1 font-medium text-brand-blue transition-colors hover:text-brand-navy"
            >
              ← Back to All Events
            </Link>
          </div>
        </Section>
      </SiteLayout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const eventsIndex = isSqliteEnabled() ? await getEventsIndex() : await readEventsIndex();
    const paths = eventsIndex.weeks.map(week => ({
      params: { startDate: week.startDate }
    }));

    return {
      paths,
      fallback: 'blocking' // Generate pages for new weeks on demand
    };
  } catch (error) {
    console.error('Error generating events week paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};

export const getStaticProps: GetStaticProps<WeekPageProps> = async ({ params }) => {
  const startDate = params?.startDate as string;

  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return {
      notFound: true
    };
  }

  try {
    const weeklyEvents = isSqliteEnabled() ? await getWeeklyEvents(startDate) : await readWeeklyEvents(startDate);
    const eventsIndex = isSqliteEnabled() ? await getEventsIndex() : await readEventsIndex();
    
    // Find navigation
    const currentWeekIndex = eventsIndex.weeks.findIndex(w => w.startDate === startDate);
    const navigation = {
      prev: currentWeekIndex > 0 ? eventsIndex.weeks[currentWeekIndex - 1]?.startDate || null : null,
      next: currentWeekIndex < eventsIndex.weeks.length - 1 ? eventsIndex.weeks[currentWeekIndex + 1]?.startDate || null : null
    };

    return {
      props: {
        weeklyEvents,
        weekStart: startDate,
        navigation
      },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching events for week:', startDate, error);
    
    // Return empty week rather than 404
    return {
      props: {
        weeklyEvents: { weekStartDate: startDate, events: [] },
        weekStart: startDate,
        navigation: { prev: null, next: null }
      },
      revalidate: 60 // Retry more frequently on error
    };
  }
};