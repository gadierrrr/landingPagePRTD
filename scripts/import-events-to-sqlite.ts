import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { db, schema } from '../db/client';
import { sql } from 'drizzle-orm';

interface EventImageJson {
  url: string;
  alt: string;
}

interface EventJson {
  id: string;
  slug: string;
  title: string;
  descriptionShort: string;
  startDateTime: string;
  endDateTime?: string;
  timezone: string;
  city: string;
  venueName?: string;
  address?: string;
  lat?: number;
  lng?: number;
  genre: string;
  free: boolean;
  priceFrom?: number;
  ageRestriction?: string;
  links?: {
    details?: string;
    tickets?: string;
  };
  canonicalUrl?: string;
  heroImage?: EventImageJson;
  gallery?: EventImageJson[];
  status?: string;
  source: string;
  lastVerifiedAt?: string;
  sponsorPlacement?: 'hero' | 'featured';
}

interface WeeklyEventsJson {
  weekStartDate: string;
  events: EventJson[];
  sponsors?: Array<{
    placement: 'hero' | 'featured';
    eventId: string;
  }>;
}

interface EventsIndexJson {
  weeks: Array<{
    startDate: string;
    eventCount: number;
    cities: string[];
    genres: string[];
    lastUpdated: string;
    prev?: string;
    next?: string;
  }>;
}

async function main() {
  const eventsDir = path.join(process.cwd(), 'data', 'events');
  const indexRaw = await readFile(path.join(eventsDir, '_index.json'), 'utf8');
  const indexJson: EventsIndexJson = JSON.parse(indexRaw);

  const weekFiles = (await readdir(eventsDir))
    .filter(name => /\d{4}-\d{2}-\d{2}\.json$/.test(name));

  const weeklyData = await Promise.all(
    weekFiles.map(async file => {
      const raw = await readFile(path.join(eventsDir, file), 'utf8');
      const parsed: WeeklyEventsJson = JSON.parse(raw);
      return parsed;
    })
  );

  await db.transaction(async tx => {
    await tx.delete(schema.eventImages);
    await tx.delete(schema.eventSponsors);
    await tx.delete(schema.events);
    await tx.delete(schema.eventWeeks);

    // Insert weeks metadata first
    for (const weekMeta of indexJson.weeks) {
      await tx.insert(schema.eventWeeks).values({
        weekStart: weekMeta.startDate,
        eventCount: weekMeta.eventCount,
        cities: JSON.stringify(weekMeta.cities),
        genres: JSON.stringify(weekMeta.genres),
        lastUpdated: weekMeta.lastUpdated
      });
    }

    // Insert events per week
    for (const week of weeklyData) {
      for (const event of week.events) {
        await tx.insert(schema.events).values({
          id: event.id,
          slug: event.slug,
          weekStart: week.weekStartDate,
          title: event.title,
          descriptionShort: event.descriptionShort,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          timezone: event.timezone,
          city: event.city,
          venueName: event.venueName,
          address: event.address,
          lat: event.lat,
          lng: event.lng,
          genre: event.genre,
          free: event.free,
          priceFrom: event.priceFrom,
          ageRestriction: event.ageRestriction,
          detailsUrl: event.links?.details,
          ticketsUrl: event.links?.tickets,
          canonicalUrl: event.canonicalUrl,
          status: event.status ?? 'scheduled',
          source: event.source,
          lastVerifiedAt: event.lastVerifiedAt
        });

        const images: Array<{ url: string; alt: string; role: string; position: number }> = [];
        if (event.heroImage) {
          images.push({
            url: event.heroImage.url,
            alt: event.heroImage.alt,
            role: 'hero',
            position: 0
          });
        }
        if (event.gallery?.length) {
          event.gallery.forEach((img, index) => {
            images.push({
              url: img.url,
              alt: img.alt,
              role: 'gallery',
              position: index
            });
          });
        }
        if (images.length) {
          await tx.insert(schema.eventImages).values(
            images.map(img => ({
              eventId: event.id,
              url: img.url,
              alt: img.alt,
              role: img.role,
              position: img.position
            }))
          );
        }
      }

      if (week.sponsors?.length) {
        await tx.insert(schema.eventSponsors).values(
          week.sponsors.map(sponsor => ({
            weekStart: week.weekStartDate,
            eventId: sponsor.eventId,
            placement: sponsor.placement
          }))
        );
      }
    }
  });

  console.log(`Imported ${weeklyData.reduce((sum, w) => sum + w.events.length, 0)} events across ${weeklyData.length} weeks`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
