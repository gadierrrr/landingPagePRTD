import { eq, inArray } from 'drizzle-orm';
import { db, schema } from './db';
import type { Event, EventsIndex, WeeklyEvents } from './forms';

function mapEventRow(row: typeof schema.events.$inferSelect): Event {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    descriptionShort: row.descriptionShort,
    startDateTime: row.startDateTime,
    endDateTime: row.endDateTime ?? undefined,
    timezone: row.timezone,
    city: row.city as Event['city'],
    venueName: row.venueName ?? undefined,
    address: row.address ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    genre: row.genre as Event['genre'],
    free: Boolean(row.free),
    priceFrom: row.priceFrom ?? undefined,
    ageRestriction: row.ageRestriction ?? undefined,
    links: {
      details: row.detailsUrl ?? undefined,
      tickets: row.ticketsUrl ?? undefined
    },
    canonicalUrl: row.canonicalUrl ?? undefined,
    heroImage: undefined,
    gallery: undefined,
    status: (row.status as Event['status']) ?? 'scheduled',
    source: row.source,
    lastVerifiedAt: row.lastVerifiedAt ?? undefined,
    sponsorPlacement: undefined
  };
}

export async function getWeeklyEvents(weekStart: string): Promise<WeeklyEvents> {
  const eventRows = await db
    .select()
    .from(schema.events)
    .where(eq(schema.events.weekStart, weekStart))
    .orderBy(schema.events.startDateTime);

  const weekly: WeeklyEvents = {
    weekStartDate: weekStart,
    events: [],
    sponsors: []
  };

  if (eventRows.length === 0) {
    return weekly;
  }

  const eventIds = eventRows.map(event => event.id);

  const [imageRows, sponsorRows] = await Promise.all([
    db
      .select()
      .from(schema.eventImages)
      .where(inArray(schema.eventImages.eventId, eventIds))
      .orderBy(schema.eventImages.eventId, schema.eventImages.position),
    db.select().from(schema.eventSponsors).where(eq(schema.eventSponsors.weekStart, weekStart))
  ]);

  const imagesByEvent = new Map<string, { hero?: Event['heroImage']; gallery: NonNullable<Event['gallery']> }>();
  for (const image of imageRows) {
    const bucket = imagesByEvent.get(image.eventId) ?? { gallery: [] };
    if (image.role === 'hero') {
      bucket.hero = { url: image.url, alt: image.alt };
    } else {
      bucket.gallery.push({ url: image.url, alt: image.alt });
    }
    imagesByEvent.set(image.eventId, bucket);
  }

  weekly.events = eventRows.map(row => {
    const event = mapEventRow(row);
    const media = imagesByEvent.get(row.id);
    if (media?.hero) {
      event.heroImage = media.hero;
    }
    if (media?.gallery?.length) {
      event.gallery = media.gallery;
    }
    return event;
  });

  if (sponsorRows.length) {
    weekly.sponsors = sponsorRows.map(s => ({ placement: s.placement as 'hero' | 'featured', eventId: s.eventId }));
  }

  return weekly;
}

export async function getEventsIndex(): Promise<EventsIndex> {
  const weeks = await db.select().from(schema.eventWeeks).orderBy(schema.eventWeeks.weekStart);
  if (weeks.length === 0) {
    return { weeks: [] };
  }

  const mapped = weeks.map((week, index, array) => ({
    startDate: week.weekStart,
    eventCount: week.eventCount,
    cities: JSON.parse(week.cities ?? '[]') as string[],
    genres: JSON.parse(week.genres ?? '[]') as string[],
    lastUpdated: week.lastUpdated,
    prev: index > 0 ? array[index - 1].weekStart : undefined,
    next: index < array.length - 1 ? array[index + 1].weekStart : undefined
  }));

  return { weeks: mapped };
}

export async function getEventBySlug(slug: string): Promise<{ event: Event; weekStart: string } | null> {
  const row = await db.query.events.findFirst({ where: eq(schema.events.slug, slug) });
  if (!row) return null;

  const event = mapEventRow(row);

  const imageRows = await db
    .select()
    .from(schema.eventImages)
    .where(eq(schema.eventImages.eventId, row.id))
    .orderBy(schema.eventImages.position);

  if (imageRows.length) {
    const hero = imageRows.find(img => img.role === 'hero');
    if (hero) {
      event.heroImage = { url: hero.url, alt: hero.alt };
    }
    const gallery = imageRows
      .filter(img => img.role !== 'hero')
      .map(img => ({ url: img.url, alt: img.alt }));
    if (gallery.length) {
      event.gallery = gallery;
    }
  }

  return {
    event,
    weekStart: row.weekStart
  };
}
