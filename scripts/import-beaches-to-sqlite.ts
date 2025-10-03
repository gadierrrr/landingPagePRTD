import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { db, schema } from '../db/client';
import { eq, sql } from 'drizzle-orm';

interface BeachJson {
  id: string;
  slug: string;
  name: string;
  municipality: string;
  coords: { lat: number; lng: number };
  tags?: string[];
  amenities?: string[];
  sargassum?: string;
  surf?: string;
  wind?: string;
  coverImage: string;
  gallery?: string[];
  aliases?: string[];
  parentId?: string;
  accessLabel?: string;
  notes?: string;
  updatedAt?: string;
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'beaches.json');
  const raw = await readFile(dataPath, 'utf8');
  const beaches: BeachJson[] = JSON.parse(raw);

  await db.transaction(async tx => {
    await tx.delete(schema.beachGallery);
    await tx.delete(schema.beachAliases);
    await tx.delete(schema.beachTags);
    await tx.delete(schema.beachAmenities);
    await tx.delete(schema.beachAuditLog);
    await tx.delete(schema.beaches);

    for (const beach of beaches) {
      await tx.insert(schema.beaches).values({
        id: beach.id,
        slug: beach.slug,
        name: beach.name,
        municipality: beach.municipality,
        lat: beach.coords.lat,
        lng: beach.coords.lng,
        sargassum: beach.sargassum,
        surf: beach.surf,
        wind: beach.wind,
        coverImage: beach.coverImage,
        parentId: beach.parentId,
        accessLabel: beach.accessLabel,
        notes: beach.notes,
        updatedAt: beach.updatedAt ?? sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      });

      if (beach.tags?.length) {
        await tx.insert(schema.beachTags).values(
          beach.tags.map(tag => ({ beachId: beach.id, tag }))
        );
      }

      if (beach.amenities?.length) {
        await tx.insert(schema.beachAmenities).values(
          beach.amenities.map(amenity => ({ beachId: beach.id, amenity }))
        );
      }

      if (beach.aliases?.length) {
        await tx.insert(schema.beachAliases).values(
          beach.aliases.map(alias => ({ beachId: beach.id, alias }))
        );
      }

      if (beach.gallery?.length) {
        await tx.insert(schema.beachGallery).values(
          beach.gallery.map((imageUrl, index) => ({
            beachId: beach.id,
            imageUrl,
            position: index
          }))
        );
      }
    }
  });

  console.log(`Imported ${beaches.length} beaches`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
