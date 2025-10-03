import { eq, inArray } from 'drizzle-orm';
import { db, schema } from './db';
import type { Event, EventsIndex, WeeklyEvents } from './forms';

function mapEventRow(row: typeof schema.events.$inferSelect): Event {
  const event: Event = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    descriptionShort: row.descriptionShort,
    startDateTime: row.startDateTime,
    timezone: row.timezone,
    city: row.city as Event['city'],
    genre: row.genre as Event['genre'],
    free: Boolean(row.free),
    status: (row.status as Event['status']) ?? 'scheduled',
    source: row.source
  };

  // Only add optional fields if they have values
  if (row.endDateTime) event.endDateTime = row.endDateTime;
  if (row.venueName) event.venueName = row.venueName;
  if (row.address) event.address = row.address;
  if (row.lat !== null && row.lat !== undefined) event.lat = row.lat;
  if (row.lng !== null && row.lng !== undefined) event.lng = row.lng;
  if (row.priceFrom !== null && row.priceFrom !== undefined) event.priceFrom = row.priceFrom;
  if (row.ageRestriction) event.ageRestriction = row.ageRestriction;
  if (row.canonicalUrl) event.canonicalUrl = row.canonicalUrl;
  if (row.lastVerifiedAt) event.lastVerifiedAt = row.lastVerifiedAt;

  // Handle links object - only add if there are actual values
  if (row.detailsUrl || row.ticketsUrl) {
    event.links = {};
    if (row.detailsUrl) event.links.details = row.detailsUrl;
    if (row.ticketsUrl) event.links.tickets = row.ticketsUrl;
  }

  return event;
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

  const mapped = weeks.map((week, index, array) => {
    const item: {
      startDate: string;
      eventCount: number;
      cities: string[];
      genres: string[];
      lastUpdated: string;
      prev?: string;
      next?: string;
    } = {
      startDate: week.weekStart,
      eventCount: week.eventCount,
      cities: JSON.parse(week.cities ?? '[]') as string[],
      genres: JSON.parse(week.genres ?? '[]') as string[],
      lastUpdated: week.lastUpdated
    };

    // Only add prev/next if they exist (omit undefined fields)
    if (index > 0) {
      item.prev = array[index - 1].weekStart;
    }
    if (index < array.length - 1) {
      item.next = array[index + 1].weekStart;
    }

    return item;
  });

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

/**
 * Create a new event with related data
 */
export async function createEvent(weekStart: string, event: Omit<Event, 'id' | 'slug'>): Promise<Event> {
  return db.transaction(async (tx) => {
    // Ensure week index exists to satisfy FK constraint
    await tx
      .insert(schema.eventWeeks)
      .values({
        weekStart,
        eventCount: 0,
        cities: JSON.stringify([]),
        genres: JSON.stringify([])
      })
      .onConflictDoNothing();

    // Generate ID and slug
    const eventId = crypto.randomUUID();
    const slug = `${event.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;

    const [newEvent] = await tx
      .insert(schema.events)
      .values({
        id: eventId,
        weekStart,
        slug,
        title: event.title,
        descriptionShort: event.descriptionShort,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime ?? null,
        timezone: event.timezone,
        city: event.city,
        venueName: event.venueName ?? null,
        address: event.address ?? null,
        lat: event.lat ?? null,
        lng: event.lng ?? null,
        genre: event.genre,
        free: event.free,
        priceFrom: event.priceFrom ?? null,
        ageRestriction: event.ageRestriction ?? null,
        detailsUrl: event.links?.details ?? null,
        ticketsUrl: event.links?.tickets ?? null,
        canonicalUrl: event.canonicalUrl ?? null,
        status: event.status ?? 'scheduled',
        source: event.source,
        lastVerifiedAt: event.lastVerifiedAt ?? null
      })
      .returning();

    // Insert hero image
    if (event.heroImage) {
      await tx.insert(schema.eventImages).values({
        eventId: newEvent.id,
        url: event.heroImage.url,
        alt: event.heroImage.alt,
        role: 'hero',
        position: 0
      });
    }

    // Insert gallery images
    if (event.gallery && event.gallery.length > 0) {
      await tx.insert(schema.eventImages).values(
        event.gallery.map((img, index) => ({
          eventId: newEvent.id,
          url: img.url,
          alt: img.alt,
          role: 'gallery' as const,
          position: index + 1
        }))
      );
    }

    // Update or create event_weeks entry
    await updateEventWeeksIndex(tx, weekStart);

    const created = await getEventById(tx, newEvent.id);
    if (!created) throw new Error('Failed to retrieve created event');
    return created;
  });
}

/**
 * Update an existing event
 */
export async function updateEvent(
  weekStart: string,
  id: string,
  updates: Partial<Omit<Event, 'id' | 'slug'>>
): Promise<Event | null> {
  return db.transaction(async (tx) => {
    const existing = await tx.query.events.findFirst({ where: eq(schema.events.id, id) });
    if (!existing) return null;

    // Update main event record
    const updateData: Record<string, unknown> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.descriptionShort !== undefined) updateData.descriptionShort = updates.descriptionShort;
    if (updates.startDateTime !== undefined) updateData.startDateTime = updates.startDateTime;
    if (updates.endDateTime !== undefined) updateData.endDateTime = updates.endDateTime ?? null;
    if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.venueName !== undefined) updateData.venueName = updates.venueName ?? null;
    if (updates.address !== undefined) updateData.address = updates.address ?? null;
    if (updates.lat !== undefined) updateData.lat = updates.lat ?? null;
    if (updates.lng !== undefined) updateData.lng = updates.lng ?? null;
    if (updates.genre !== undefined) updateData.genre = updates.genre;
    if (updates.free !== undefined) updateData.free = updates.free;
    if (updates.priceFrom !== undefined) updateData.priceFrom = updates.priceFrom ?? null;
    if (updates.ageRestriction !== undefined) updateData.ageRestriction = updates.ageRestriction ?? null;
    if (updates.links?.details !== undefined) updateData.detailsUrl = updates.links.details ?? null;
    if (updates.links?.tickets !== undefined) updateData.ticketsUrl = updates.links.tickets ?? null;
    if (updates.canonicalUrl !== undefined) updateData.canonicalUrl = updates.canonicalUrl ?? null;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.source !== undefined) updateData.source = updates.source;
    if (updates.lastVerifiedAt !== undefined) updateData.lastVerifiedAt = updates.lastVerifiedAt ?? null;

    if (Object.keys(updateData).length > 0) {
      await tx.update(schema.events).set(updateData).where(eq(schema.events.id, id));
    }

    // Update images if provided
    if (updates.heroImage !== undefined || updates.gallery !== undefined) {
      await tx.delete(schema.eventImages).where(eq(schema.eventImages.eventId, id));

      const imagesToInsert: Array<typeof schema.eventImages.$inferInsert> = [];

      if (updates.heroImage) {
        imagesToInsert.push({
          eventId: id,
          url: updates.heroImage.url,
          alt: updates.heroImage.alt,
          role: 'hero',
          position: 0
        });
      }

      if (updates.gallery && updates.gallery.length > 0) {
        imagesToInsert.push(
          ...updates.gallery.map((img, index) => ({
            eventId: id,
            url: img.url,
            alt: img.alt,
            role: 'gallery' as const,
            position: index + 1
          }))
        );
      }

      if (imagesToInsert.length > 0) {
        await tx.insert(schema.eventImages).values(imagesToInsert);
      }
    }

    // Update event_weeks index
    await updateEventWeeksIndex(tx, weekStart);

    return getEventById(tx, id);
  });
}

/**
 * Delete an event and related data
 */
export async function deleteEvent(weekStart: string, id: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const existing = await tx.query.events.findFirst({ where: eq(schema.events.id, id) });
    if (!existing) return false;

    // Delete related images
    await tx.delete(schema.eventImages).where(eq(schema.eventImages.eventId, id));

    // Delete sponsor placements
    await tx.delete(schema.eventSponsors).where(eq(schema.eventSponsors.eventId, id));

    // Delete main event record
    await tx.delete(schema.events).where(eq(schema.events.id, id));

    // Update event_weeks index
    await updateEventWeeksIndex(tx, weekStart);

    return true;
  });
}

/**
 * Helper to get event by ID within a transaction
 */
async function getEventById(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  id: string
): Promise<Event | null> {
  const row = await tx.query.events.findFirst({ where: eq(schema.events.id, id) });
  if (!row) return null;

  const event = mapEventRow(row);

  const imageRows = await tx
    .select()
    .from(schema.eventImages)
    .where(eq(schema.eventImages.eventId, id))
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

  return event;
}

/**
 * Helper to update the event_weeks index for a given week
 */
async function updateEventWeeksIndex(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  weekStart: string
): Promise<void> {
  const events = await tx
    .select()
    .from(schema.events)
    .where(eq(schema.events.weekStart, weekStart));

  if (events.length === 0) {
    // No events for this week, delete the index entry
    await tx.delete(schema.eventWeeks).where(eq(schema.eventWeeks.weekStart, weekStart));
    return;
  }

  const cities = [...new Set(events.map(e => e.city))];
  const genres = [...new Set(events.map(e => e.genre))];

  // Upsert event_weeks entry
  await tx
    .insert(schema.eventWeeks)
    .values({
      weekStart,
      eventCount: events.length,
      cities: JSON.stringify(cities),
      genres: JSON.stringify(genres),
      lastUpdated: new Date().toISOString()
    })
    .onConflictDoUpdate({
      target: schema.eventWeeks.weekStart,
      set: {
        eventCount: events.length,
        cities: JSON.stringify(cities),
        genres: JSON.stringify(genres),
        lastUpdated: new Date().toISOString()
      }
    });
}
