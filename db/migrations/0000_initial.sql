BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "beaches" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "municipality" TEXT NOT NULL,
  "lat" REAL NOT NULL,
  "lng" REAL NOT NULL,
  "sargassum" TEXT,
  "surf" TEXT,
  "wind" TEXT,
  "cover_image" TEXT NOT NULL,
  "access_label" TEXT,
  "notes" TEXT,
  "parent_id" TEXT,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "beaches_slug_idx" ON "beaches" ("slug");
CREATE INDEX IF NOT EXISTS "beaches_municipality_idx" ON "beaches" ("municipality");
CREATE INDEX IF NOT EXISTS "beaches_parent_idx" ON "beaches" ("parent_id");

CREATE TABLE IF NOT EXISTS "beach_tags" (
  "beach_id" TEXT NOT NULL,
  "tag" TEXT NOT NULL,
  CONSTRAINT "beach_tags_pk" PRIMARY KEY ("beach_id", "tag"),
  FOREIGN KEY ("beach_id") REFERENCES "beaches"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "beach_tags_tag_idx" ON "beach_tags" ("tag");

CREATE TABLE IF NOT EXISTS "beach_amenities" (
  "beach_id" TEXT NOT NULL,
  "amenity" TEXT NOT NULL,
  CONSTRAINT "beach_amenities_pk" PRIMARY KEY ("beach_id", "amenity"),
  FOREIGN KEY ("beach_id") REFERENCES "beaches"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "beach_amenity_idx" ON "beach_amenities" ("amenity");

CREATE TABLE IF NOT EXISTS "beach_gallery" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "beach_id" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY ("beach_id") REFERENCES "beaches"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "beach_gallery_beach_idx" ON "beach_gallery" ("beach_id");

CREATE TABLE IF NOT EXISTS "beach_aliases" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "beach_id" TEXT NOT NULL,
  "alias" TEXT NOT NULL,
  FOREIGN KEY ("beach_id") REFERENCES "beaches"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "beach_aliases_beach_idx" ON "beach_aliases" ("beach_id");
CREATE INDEX IF NOT EXISTS "beach_aliases_alias_idx" ON "beach_aliases" ("alias");

CREATE TABLE IF NOT EXISTS "beach_audit_log" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "timestamp" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  "admin_user" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "beach_id" TEXT,
  "before_hash" TEXT,
  "after_hash" TEXT,
  "duplicate_decision" TEXT,
  "ip_address" TEXT
);
CREATE INDEX IF NOT EXISTS "beach_audit_beach_idx" ON "beach_audit_log" ("beach_id");
CREATE INDEX IF NOT EXISTS "beach_audit_timestamp_idx" ON "beach_audit_log" ("timestamp");

CREATE TABLE IF NOT EXISTS "deals" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amount_label" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "expiry" TEXT,
  "partner" TEXT,
  "external_url" TEXT,
  "full_description" TEXT,
  "terms" TEXT,
  "expires_at" TEXT,
  "price" REAL,
  "original_price" REAL,
  "currency" TEXT,
  "source_name" TEXT,
  "updated_at" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "deals_slug_idx" ON "deals" ("slug");
CREATE INDEX IF NOT EXISTS "deals_category_idx" ON "deals" ("category");
CREATE INDEX IF NOT EXISTS "deals_updated_idx" ON "deals" ("updated_at");

CREATE TABLE IF NOT EXISTS "deal_gallery" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "deal_id" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "deal_gallery_deal_idx" ON "deal_gallery" ("deal_id");

CREATE TABLE IF NOT EXISTS "deal_highlights" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "deal_id" TEXT NOT NULL,
  "highlight" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "deal_highlights_deal_idx" ON "deal_highlights" ("deal_id");

CREATE TABLE IF NOT EXISTS "deal_howto_steps" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "deal_id" TEXT NOT NULL,
  "step" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "deal_howto_deal_idx" ON "deal_howto_steps" ("deal_id");

CREATE TABLE IF NOT EXISTS "event_weeks" (
  "week_start" TEXT PRIMARY KEY NOT NULL,
  "event_count" INTEGER NOT NULL DEFAULT 0,
  "cities" TEXT,
  "genres" TEXT,
  "last_updated" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS "events" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "slug" TEXT NOT NULL,
  "week_start" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description_short" TEXT NOT NULL,
  "start_datetime" TEXT NOT NULL,
  "end_datetime" TEXT,
  "timezone" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "venue_name" TEXT,
  "address" TEXT,
  "lat" REAL,
  "lng" REAL,
  "genre" TEXT NOT NULL,
  "free" INTEGER NOT NULL DEFAULT 0,
  "price_from" REAL,
  "age_restriction" TEXT,
  "details_url" TEXT,
  "tickets_url" TEXT,
  "canonical_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "source" TEXT NOT NULL,
  "last_verified_at" TEXT,
  FOREIGN KEY ("week_start") REFERENCES "event_weeks"("week_start") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_idx" ON "events" ("slug");
CREATE INDEX IF NOT EXISTS "events_week_idx" ON "events" ("week_start");
CREATE INDEX IF NOT EXISTS "events_city_idx" ON "events" ("city");
CREATE INDEX IF NOT EXISTS "events_genre_idx" ON "events" ("genre");

CREATE TABLE IF NOT EXISTS "event_images" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "event_id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'gallery',
  "position" INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "event_images_event_idx" ON "event_images" ("event_id");

CREATE TABLE IF NOT EXISTS "event_sponsors" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "week_start" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "placement" TEXT NOT NULL,
  FOREIGN KEY ("week_start") REFERENCES "event_weeks"("week_start") ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "event_sponsors_week_idx" ON "event_sponsors" ("week_start");
CREATE INDEX IF NOT EXISTS "event_sponsors_event_idx" ON "event_sponsors" ("event_id");

COMMIT;
