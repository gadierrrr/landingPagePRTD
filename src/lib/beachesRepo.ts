import { eq, inArray } from 'drizzle-orm';
import { db, schema } from './db';
import type { Beach } from './forms';

function mapBeachRow(row: typeof schema.beaches.$inferSelect): Beach {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    municipality: row.municipality as Beach['municipality'],
    coords: { lat: row.lat, lng: row.lng },
    sargassum: row.sargassum as Beach['sargassum'],
    surf: row.surf as Beach['surf'],
    wind: row.wind as Beach['wind'],
    coverImage: row.coverImage,
    accessLabel: row.accessLabel ?? undefined,
    notes: row.notes ?? undefined,
    parentId: row.parentId ?? undefined,
    updatedAt: row.updatedAt ?? undefined,
    tags: [],
    amenities: [],
    gallery: [],
    aliases: []
  };
}

export async function getAllBeaches(): Promise<Beach[]> {
  const beachRows = await db.select().from(schema.beaches);
  if (beachRows.length === 0) {
    return [];
  }

  const ids = beachRows.map(b => b.id);

  const [tagRows, amenityRows, galleryRows, aliasRows] = await Promise.all([
    db.select().from(schema.beachTags).where(inArray(schema.beachTags.beachId, ids)),
    db.select().from(schema.beachAmenities).where(inArray(schema.beachAmenities.beachId, ids)),
    db
      .select()
      .from(schema.beachGallery)
      .where(inArray(schema.beachGallery.beachId, ids))
      .orderBy(schema.beachGallery.beachId, schema.beachGallery.position),
    db.select().from(schema.beachAliases).where(inArray(schema.beachAliases.beachId, ids))
  ]);

  const tagsById = new Map<string, string[]>();
  for (const tag of tagRows) {
    const arr = tagsById.get(tag.beachId) ?? [];
    arr.push(tag.tag);
    tagsById.set(tag.beachId, arr);
  }

  const amenitiesById = new Map<string, string[]>();
  for (const amenity of amenityRows) {
    const arr = amenitiesById.get(amenity.beachId) ?? [];
    arr.push(amenity.amenity);
    amenitiesById.set(amenity.beachId, arr);
  }

  const galleryById = new Map<string, string[]>();
  for (const image of galleryRows) {
    const arr = galleryById.get(image.beachId) ?? [];
    arr.push(image.imageUrl);
    galleryById.set(image.beachId, arr);
  }

  const aliasesById = new Map<string, string[]>();
  for (const alias of aliasRows) {
    const arr = aliasesById.get(alias.beachId) ?? [];
    arr.push(alias.alias);
    aliasesById.set(alias.beachId, arr);
  }

  return beachRows.map(row => {
    const beach = mapBeachRow(row);
    beach.tags = (tagsById.get(row.id) ?? []) as Beach['tags'];
    beach.amenities = (amenitiesById.get(row.id) ?? []) as Beach['amenities'];
    beach.gallery = galleryById.get(row.id) ?? [];
    beach.aliases = aliasesById.get(row.id) ?? [];
    return beach;
  });
}

export async function getBeachBySlug(slug: string): Promise<Beach | null> {
  const row = await db.query.beaches.findFirst({ where: eq(schema.beaches.slug, slug) });
  if (!row) {
    return null;
  }

  const beach = mapBeachRow(row);

  const [tags, amenities, gallery, aliases] = await Promise.all([
    db.select().from(schema.beachTags).where(eq(schema.beachTags.beachId, row.id)),
    db.select().from(schema.beachAmenities).where(eq(schema.beachAmenities.beachId, row.id)),
    db
      .select()
      .from(schema.beachGallery)
      .where(eq(schema.beachGallery.beachId, row.id))
      .orderBy(schema.beachGallery.position),
    db.select().from(schema.beachAliases).where(eq(schema.beachAliases.beachId, row.id))
  ]);

  beach.tags = tags.map(t => t.tag) as Beach['tags'];
  beach.amenities = amenities.map(a => a.amenity) as Beach['amenities'];
  beach.gallery = gallery.map(g => g.imageUrl);
  beach.aliases = aliases.map(a => a.alias);

  return beach;
}
