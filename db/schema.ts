import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex
} from 'drizzle-orm/sqlite-core';

export const beaches = sqliteTable(
  'beaches',
  {
    id: text('id').notNull().primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    municipality: text('municipality').notNull(),
    lat: real('lat').notNull(),
    lng: real('lng').notNull(),
    sargassum: text('sargassum'),
    surf: text('surf'),
    wind: text('wind'),
    coverImage: text('cover_image').notNull(),
    accessLabel: text('access_label'),
    notes: text('notes'),
    parentId: text('parent_id'),
    // Rich content fields (added 2025-10-06)
    description: text('description'), // Extended intro (up to 2000 chars)
    parkingDetails: text('parking_details'), // Specific parking info
    safetyInfo: text('safety_info'), // Warnings and safety tips
    localTips: text('local_tips'), // Local context and vendor info
    bestTime: text('best_time'), // Best time to visit
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`)
  },
  table => ({
    slugIdx: uniqueIndex('beaches_slug_idx').on(table.slug),
    municipalityIdx: index('beaches_municipality_idx').on(table.municipality),
    parentIdx: index('beaches_parent_idx').on(table.parentId)
  })
);

export const beachTags = sqliteTable(
  'beach_tags',
  {
    beachId: text('beach_id')
      .notNull()
      .references(() => beaches.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    tag: text('tag').notNull()
  },
  table => ({
    pk: primaryKey({ name: 'beach_tags_pk', columns: [table.beachId, table.tag] }),
    tagIdx: index('beach_tags_tag_idx').on(table.tag)
  })
);

export const beachAmenities = sqliteTable(
  'beach_amenities',
  {
    beachId: text('beach_id')
      .notNull()
      .references(() => beaches.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    amenity: text('amenity').notNull()
  },
  table => ({
    pk: primaryKey({ name: 'beach_amenities_pk', columns: [table.beachId, table.amenity] }),
    amenityIdx: index('beach_amenity_idx').on(table.amenity)
  })
);

export const beachGallery = sqliteTable(
  'beach_gallery',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    beachId: text('beach_id')
      .notNull()
      .references(() => beaches.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    position: integer('position').notNull().default(0)
  },
  table => ({
    beachIdx: index('beach_gallery_beach_idx').on(table.beachId)
  })
);

export const beachAliases = sqliteTable(
  'beach_aliases',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    beachId: text('beach_id')
      .notNull()
      .references(() => beaches.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    alias: text('alias').notNull()
  },
  table => ({
    beachIdx: index('beach_aliases_beach_idx').on(table.beachId),
    aliasIdx: index('beach_aliases_alias_idx').on(table.alias)
  })
);

export const beachAuditLog = sqliteTable(
  'beach_audit_log',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    timestamp: text('timestamp')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
    adminUser: text('admin_user').notNull(),
    action: text('action').notNull(),
    beachId: text('beach_id'),
    beforeHash: text('before_hash'),
    afterHash: text('after_hash'),
    duplicateDecision: text('duplicate_decision'),
    ipAddress: text('ip_address')
  },
  table => ({
    beachIdx: index('beach_audit_beach_idx').on(table.beachId),
    tsIdx: index('beach_audit_timestamp_idx').on(table.timestamp)
  })
);

export const beachFeatures = sqliteTable(
  'beach_features',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    beachId: text('beach_id')
      .notNull()
      .references(() => beaches.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    position: integer('position').notNull().default(0)
  },
  table => ({
    beachIdx: index('beach_features_beach_idx').on(table.beachId)
  })
);

export const beachTips = sqliteTable(
  'beach_tips',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    beachId: text('beach_id')
      .notNull()
      .references(() => beaches.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    category: text('category').notNull(),
    tip: text('tip').notNull(),
    position: integer('position').notNull().default(0)
  },
  table => ({
    beachIdx: index('beach_tips_beach_idx').on(table.beachId),
    categoryIdx: index('beach_tips_category_idx').on(table.category)
  })
);

export const deals = sqliteTable(
  'deals',
  {
    id: text('id').notNull().primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    amountLabel: text('amount_label').notNull(),
    location: text('location').notNull(),
    image: text('image').notNull(),
    category: text('category').notNull(),
    expiry: text('expiry'),
    partner: text('partner'),
    externalUrl: text('external_url'),
    fullDescription: text('full_description'),
    terms: text('terms'),
    expiresAt: text('expires_at'),
    price: real('price'),
    originalPrice: real('original_price'),
    currency: text('currency'),
    sourceName: text('source_name'),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`)
  },
  table => ({
    slugIdx: uniqueIndex('deals_slug_idx').on(table.slug),
    categoryIdx: index('deals_category_idx').on(table.category),
    updatedIdx: index('deals_updated_idx').on(table.updatedAt)
  })
);

export const dealGallery = sqliteTable(
  'deal_gallery',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    dealId: text('deal_id')
      .notNull()
      .references(() => deals.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    position: integer('position').notNull().default(0)
  },
  table => ({
    dealIdx: index('deal_gallery_deal_idx').on(table.dealId)
  })
);

export const dealHighlights = sqliteTable(
  'deal_highlights',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    dealId: text('deal_id')
      .notNull()
      .references(() => deals.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    highlight: text('highlight').notNull(),
    position: integer('position').notNull().default(0)
  },
  table => ({
    dealIdx: index('deal_highlights_deal_idx').on(table.dealId)
  })
);

export const dealHowToSteps = sqliteTable(
  'deal_howto_steps',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    dealId: text('deal_id')
      .notNull()
      .references(() => deals.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    step: text('step').notNull(),
    position: integer('position').notNull().default(0)
  },
  table => ({
    dealIdx: index('deal_howto_deal_idx').on(table.dealId)
  })
);

export const eventWeeks = sqliteTable(
  'event_weeks',
  {
    weekStart: text('week_start').notNull().primaryKey(),
    eventCount: integer('event_count').notNull().default(0),
    cities: text('cities'),
    genres: text('genres'),
    lastUpdated: text('last_updated')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`)
  }
);

export const events = sqliteTable(
  'events',
  {
    id: text('id').notNull().primaryKey(),
    slug: text('slug').notNull(),
    weekStart: text('week_start')
      .notNull()
      .references(() => eventWeeks.weekStart, { onDelete: 'cascade', onUpdate: 'cascade' }),
    title: text('title').notNull(),
    descriptionShort: text('description_short').notNull(),
    startDateTime: text('start_datetime').notNull(),
    endDateTime: text('end_datetime'),
    timezone: text('timezone').notNull(),
    city: text('city').notNull(),
    venueName: text('venue_name'),
    address: text('address'),
    lat: real('lat'),
    lng: real('lng'),
    genre: text('genre').notNull(),
    free: integer('free', { mode: 'boolean' }).notNull().default(false),
    priceFrom: real('price_from'),
    ageRestriction: text('age_restriction'),
    detailsUrl: text('details_url'),
    ticketsUrl: text('tickets_url'),
    canonicalUrl: text('canonical_url'),
    status: text('status').notNull().default('scheduled'),
    source: text('source').notNull(),
    lastVerifiedAt: text('last_verified_at')
  },
  table => ({
    slugIdx: uniqueIndex('events_slug_idx').on(table.slug),
    weekIdx: index('events_week_idx').on(table.weekStart),
    cityIdx: index('events_city_idx').on(table.city),
    genreIdx: index('events_genre_idx').on(table.genre)
  })
);

export const eventImages = sqliteTable(
  'event_images',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    url: text('url').notNull(),
    alt: text('alt').notNull(),
    role: text('role').notNull().default('gallery'),
    position: integer('position').notNull().default(0)
  },
  table => ({
    eventIdx: index('event_images_event_idx').on(table.eventId)
  })
);

export const eventSponsors = sqliteTable(
  'event_sponsors',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    weekStart: text('week_start')
      .notNull()
      .references(() => eventWeeks.weekStart, { onDelete: 'cascade', onUpdate: 'cascade' }),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    placement: text('placement').notNull()
  },
  table => ({
    weekIdx: index('event_sponsors_week_idx').on(table.weekStart),
    eventIdx: index('event_sponsors_event_idx').on(table.eventId)
  })
);
