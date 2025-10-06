import { eq, inArray } from 'drizzle-orm';
import crypto from 'crypto';
import { db, schema } from './db';
import type { Beach, BeachFeature, BeachTip } from './forms';
import { generateBeachSlug } from './slugGenerator';

// Duplicate detection utilities
interface DuplicateCandidate {
  beach: Beach;
  distance: number;
  nameSimilarity: number;
  reason: string;
}

function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

function generateDataHash(beach: Partial<Beach>): string {
  const dataForHash = { ...beach };
  delete dataForHash.updatedAt;
  return crypto.createHash('md5').update(JSON.stringify(dataForHash)).digest('hex');
}

function mapBeachRow(row: typeof schema.beaches.$inferSelect): Beach {
  const beach: Beach = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    municipality: row.municipality as Beach['municipality'],
    coords: { lat: row.lat, lng: row.lng },
    sargassum: (row.sargassum ?? undefined) as Beach['sargassum'],
    surf: (row.surf ?? undefined) as Beach['surf'],
    wind: (row.wind ?? undefined) as Beach['wind'],
    coverImage: row.coverImage,
    accessLabel: row.accessLabel ?? undefined,
    notes: row.notes ?? undefined,
    // Rich content fields (added 2025-10-06)
    description: row.description ?? undefined,
    parkingDetails: row.parkingDetails ?? undefined,
    safetyInfo: row.safetyInfo ?? undefined,
    localTips: row.localTips ?? undefined,
    bestTime: row.bestTime ?? undefined,
    updatedAt: row.updatedAt,
    tags: [],
    amenities: [],
    gallery: [],
    aliases: [],
    features: [],
    tips: []
  };

  // Only add parentId if it exists (omit when null/undefined)
  if (row.parentId) {
    beach.parentId = row.parentId;
  }

  return beach;
}

/**
 * Get all beaches with lightweight data (no rich content fields)
 * Used for list views and filtering where full content is not needed
 * Returns: id, slug, name, municipality, coords, sargassum, surf, wind,
 *          coverImage, accessLabel, notes, tags, amenities
 * Excludes: description, parkingDetails, safetyInfo, localTips, bestTime,
 *           features, tips, gallery, aliases
 */
export async function getAllBeachesLight(): Promise<Beach[]> {
  const beachRows = await db.select().from(schema.beaches);
  if (beachRows.length === 0) {
    return [];
  }

  const ids = beachRows.map(b => b.id);

  // Only fetch tags and amenities (needed for filtering)
  const [tagRows, amenityRows] = await Promise.all([
    db.select().from(schema.beachTags).where(inArray(schema.beachTags.beachId, ids)),
    db.select().from(schema.beachAmenities).where(inArray(schema.beachAmenities.beachId, ids))
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

  return beachRows.map(row => {
    const beach = mapBeachRow(row);
    beach.tags = (tagsById.get(row.id) ?? []) as Beach['tags'];
    beach.amenities = (amenitiesById.get(row.id) ?? []) as Beach['amenities'];
    // Set empty arrays for excluded fields
    beach.gallery = [];
    beach.aliases = [];
    beach.features = [];
    beach.tips = [];
    return beach;
  });
}

export async function getAllBeaches(): Promise<Beach[]> {
  const beachRows = await db.select().from(schema.beaches);
  if (beachRows.length === 0) {
    return [];
  }

  const ids = beachRows.map(b => b.id);

  const [tagRows, amenityRows, galleryRows, aliasRows, featureRows, tipRows] = await Promise.all([
    db.select().from(schema.beachTags).where(inArray(schema.beachTags.beachId, ids)),
    db.select().from(schema.beachAmenities).where(inArray(schema.beachAmenities.beachId, ids)),
    db
      .select()
      .from(schema.beachGallery)
      .where(inArray(schema.beachGallery.beachId, ids))
      .orderBy(schema.beachGallery.beachId, schema.beachGallery.position),
    db.select().from(schema.beachAliases).where(inArray(schema.beachAliases.beachId, ids)),
    db
      .select()
      .from(schema.beachFeatures)
      .where(inArray(schema.beachFeatures.beachId, ids))
      .orderBy(schema.beachFeatures.beachId, schema.beachFeatures.position),
    db
      .select()
      .from(schema.beachTips)
      .where(inArray(schema.beachTips.beachId, ids))
      .orderBy(schema.beachTips.beachId, schema.beachTips.position)
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

  const featuresById = new Map<string, BeachFeature[]>();
  for (const feature of featureRows) {
    const arr = featuresById.get(feature.beachId) ?? [];
    arr.push({ title: feature.title, description: feature.description });
    featuresById.set(feature.beachId, arr);
  }

  const tipsById = new Map<string, BeachTip[]>();
  for (const tip of tipRows) {
    const arr = tipsById.get(tip.beachId) ?? [];
    arr.push({ category: tip.category, tip: tip.tip });
    tipsById.set(tip.beachId, arr);
  }

  return beachRows.map(row => {
    const beach = mapBeachRow(row);
    beach.tags = (tagsById.get(row.id) ?? []) as Beach['tags'];
    beach.amenities = (amenitiesById.get(row.id) ?? []) as Beach['amenities'];
    beach.gallery = galleryById.get(row.id) ?? [];
    beach.aliases = aliasesById.get(row.id) ?? [];
    beach.features = featuresById.get(row.id) ?? [];
    beach.tips = tipsById.get(row.id) ?? [];
    return beach;
  });
}

export async function getBeachBySlug(slug: string): Promise<Beach | null> {
  const row = await db.query.beaches.findFirst({ where: eq(schema.beaches.slug, slug) });
  if (!row) {
    return null;
  }

  const beach = mapBeachRow(row);

  const [tags, amenities, gallery, aliases, features, tips] = await Promise.all([
    db.select().from(schema.beachTags).where(eq(schema.beachTags.beachId, row.id)),
    db.select().from(schema.beachAmenities).where(eq(schema.beachAmenities.beachId, row.id)),
    db
      .select()
      .from(schema.beachGallery)
      .where(eq(schema.beachGallery.beachId, row.id))
      .orderBy(schema.beachGallery.position),
    db.select().from(schema.beachAliases).where(eq(schema.beachAliases.beachId, row.id)),
    db
      .select()
      .from(schema.beachFeatures)
      .where(eq(schema.beachFeatures.beachId, row.id))
      .orderBy(schema.beachFeatures.position),
    db
      .select()
      .from(schema.beachTips)
      .where(eq(schema.beachTips.beachId, row.id))
      .orderBy(schema.beachTips.position)
  ]);

  beach.tags = tags.map(t => t.tag) as Beach['tags'];
  beach.amenities = amenities.map(a => a.amenity) as Beach['amenities'];
  beach.gallery = gallery.map(g => g.imageUrl);
  beach.aliases = aliases.map(a => a.alias);
  beach.features = features.map(f => ({ title: f.title, description: f.description }));
  beach.tips = tips.map(t => ({ category: t.category, tip: t.tip }));

  return beach;
}

/**
 * Get related beaches for a given beach
 * Simple scoring based on same municipality and shared tags
 * Returns lightweight beach data (no full content)
 */
export async function getRelatedBeaches(beachId: string, limit = 6): Promise<Beach[]> {
  // Get the current beach
  const currentBeach = await db.query.beaches.findFirst({
    where: eq(schema.beaches.id, beachId)
  });

  if (!currentBeach) {
    return [];
  }

  // Get current beach tags
  const currentTags = await db
    .select()
    .from(schema.beachTags)
    .where(eq(schema.beachTags.beachId, beachId));

  const currentTagValues = currentTags.map(t => t.tag);

  // Get all other beaches in same municipality or with shared tags
  const candidateBeaches = await db
    .select()
    .from(schema.beaches)
    .where(eq(schema.beaches.municipality, currentBeach.municipality));

  // Score and filter
  const scored = await Promise.all(
    candidateBeaches
      .filter(b => b.id !== beachId)
      .map(async (beach) => {
        let score = 0;

        // Same municipality bonus
        score += 10;

        // Shared tags bonus
        const beachTags = await db
          .select()
          .from(schema.beachTags)
          .where(eq(schema.beachTags.beachId, beach.id));

        const beachTagValues = beachTags.map(t => t.tag);
        const sharedTags = currentTagValues.filter(t => beachTagValues.includes(t));
        score += sharedTags.length * 3;

        return { beach, score };
      })
  );

  // Sort by score and take top results
  const topBeaches = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.beach);

  // Fetch tags for top beaches
  const beachIds = topBeaches.map(b => b.id);
  if (beachIds.length === 0) {
    return [];
  }

  const [tagRows, amenityRows] = await Promise.all([
    db.select().from(schema.beachTags).where(inArray(schema.beachTags.beachId, beachIds)),
    db.select().from(schema.beachAmenities).where(inArray(schema.beachAmenities.beachId, beachIds))
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

  return topBeaches.map(row => {
    const beach = mapBeachRow(row);
    beach.tags = (tagsById.get(row.id) ?? []) as Beach['tags'];
    beach.amenities = (amenitiesById.get(row.id) ?? []) as Beach['amenities'];
    beach.gallery = [];
    beach.aliases = [];
    beach.features = [];
    beach.tips = [];
    return beach;
  });
}

// Write operations
export async function findDuplicateCandidates(
  beach: Omit<Beach, 'id' | 'slug'>,
  excludeId?: string
): Promise<DuplicateCandidate[]> {
  const beaches = await getAllBeaches();
  const candidates: DuplicateCandidate[]  = [];

  for (const existingBeach of beaches) {
    if (excludeId && existingBeach.id === excludeId) {
      continue;
    }

    if (existingBeach.municipality !== beach.municipality) {
      continue;
    }

    const distance = calculateDistance(
      beach.coords.lat, beach.coords.lng,
      existingBeach.coords.lat, existingBeach.coords.lng
    );

    const nameSimilarity = calculateStringSimilarity(beach.name, existingBeach.name);

    let maxSimilarity = nameSimilarity;
    if (beach.aliases) {
      for (const alias of beach.aliases) {
        const aliasSimilarity = calculateStringSimilarity(alias, existingBeach.name);
        if (aliasSimilarity > maxSimilarity) {
          maxSimilarity = aliasSimilarity;
        }
      }
    }
    if (existingBeach.aliases) {
      for (const existingAlias of existingBeach.aliases) {
        const aliasSimilarity = calculateStringSimilarity(beach.name, existingAlias);
        if (aliasSimilarity > maxSimilarity) {
          maxSimilarity = aliasSimilarity;
        }
      }
    }

    if (distance < 250 && maxSimilarity >= 0.85) {
      let reason = `${Math.round(distance)}m away`;
      if (maxSimilarity >= 0.95) {
        reason += ', very similar name';
      } else if (maxSimilarity >= 0.9) {
        reason += ', similar name';
      }

      candidates.push({
        beach: existingBeach,
        distance,
        nameSimilarity: maxSimilarity,
        reason
      });
    }
  }

  candidates.sort((a, b) => {
    if (Math.abs(a.distance - b.distance) < 50) {
      return b.nameSimilarity - a.nameSimilarity;
    }
    return a.distance - b.distance;
  });

  return candidates;
}

export async function createBeach(
  beach: Omit<Beach, 'id' | 'slug'>,
  options: { duplicateDecision?: 'save_anyway' | 'merge'; adminUser?: string; ipAddress?: string } = {}
): Promise<Beach> {
  const allBeaches = await getAllBeaches();
  const existingSlugs = allBeaches.map(b => b.slug).filter(Boolean) as string[];

  const beachId = crypto.randomUUID();
  const slug = generateBeachSlug(beach.name, beach.municipality, beach.coords, existingSlugs);
  const now = new Date().toISOString();

  const beforeHash = generateDataHash(beach);

  return await db.transaction(async (tx) => {
    // Insert main beach record
    await tx.insert(schema.beaches).values({
      id: beachId,
      slug,
      name: beach.name,
      municipality: beach.municipality,
      lat: beach.coords.lat,
      lng: beach.coords.lng,
      sargassum: beach.sargassum,
      surf: beach.surf,
      wind: beach.wind,
      coverImage: beach.coverImage,
      accessLabel: beach.accessLabel,
      notes: beach.notes,
      parentId: beach.parentId,
      description: beach.description,
      parkingDetails: beach.parkingDetails,
      safetyInfo: beach.safetyInfo,
      localTips: beach.localTips,
      bestTime: beach.bestTime,
      updatedAt: now
    });

    // Insert tags
    if (beach.tags?.length) {
      await tx.insert(schema.beachTags).values(
        beach.tags.map(tag => ({ beachId, tag }))
      );
    }

    // Insert amenities
    if (beach.amenities?.length) {
      await tx.insert(schema.beachAmenities).values(
        beach.amenities.map(amenity => ({ beachId, amenity }))
      );
    }

    // Insert gallery
    if (beach.gallery?.length) {
      await tx.insert(schema.beachGallery).values(
        beach.gallery.map((imageUrl, index) => ({
          beachId,
          imageUrl,
          position: index
        }))
      );
    }

    // Insert aliases
    if (beach.aliases?.length) {
      await tx.insert(schema.beachAliases).values(
        beach.aliases.map(alias => ({ beachId, alias }))
      );
    }

    // Insert features
    if (beach.features?.length) {
      await tx.insert(schema.beachFeatures).values(
        beach.features.map((feature, index) => ({
          beachId,
          title: feature.title,
          description: feature.description,
          position: index
        }))
      );
    }

    // Insert tips
    if (beach.tips?.length) {
      await tx.insert(schema.beachTips).values(
        beach.tips.map((tip, index) => ({
          beachId,
          category: tip.category,
          tip: tip.tip,
          position: index
        }))
      );
    }

    // Audit log
    await tx.insert(schema.beachAuditLog).values({
      timestamp: now,
      adminUser: options.adminUser || 'unknown',
      action: 'CREATE',
      beachId,
      afterHash: beforeHash,
      duplicateDecision: options.duplicateDecision,
      ipAddress: options.ipAddress
    });

    return {
      ...beach,
      id: beachId,
      slug,
      updatedAt: now,
      tags: beach.tags || [],
      amenities: beach.amenities || [],
      gallery: beach.gallery || [],
      aliases: beach.aliases || [],
      features: beach.features || [],
      tips: beach.tips || []
    };
  });
}

export async function updateBeach(
  id: string,
  updates: Partial<Omit<Beach, 'id' | 'slug'>>,
  options: { duplicateDecision?: 'save_anyway' | 'merge'; adminUser?: string; ipAddress?: string } = {}
): Promise<Beach | null> {
  const beach = await db.query.beaches.findFirst({ where: eq(schema.beaches.id, id) });

  if (!beach) {
    return null;
  }

  const beforeHash = generateDataHash(mapBeachRow(beach));
  const now = new Date().toISOString();

  return await db.transaction(async (tx) => {
    // Update main beach record
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.municipality !== undefined) updateData.municipality = updates.municipality;
    if (updates.coords) {
      updateData.lat = updates.coords.lat;
      updateData.lng = updates.coords.lng;
    }
    if (updates.sargassum !== undefined) updateData.sargassum = updates.sargassum;
    if (updates.surf !== undefined) updateData.surf = updates.surf;
    if (updates.wind !== undefined) updateData.wind = updates.wind;
    if (updates.coverImage !== undefined) updateData.coverImage = updates.coverImage;
    if (updates.accessLabel !== undefined) updateData.accessLabel = updates.accessLabel;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.parentId !== undefined) updateData.parentId = updates.parentId;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.parkingDetails !== undefined) updateData.parkingDetails = updates.parkingDetails;
    if (updates.safetyInfo !== undefined) updateData.safetyInfo = updates.safetyInfo;
    if (updates.localTips !== undefined) updateData.localTips = updates.localTips;
    if (updates.bestTime !== undefined) updateData.bestTime = updates.bestTime;

    await tx.update(schema.beaches)
      .set(updateData)
      .where(eq(schema.beaches.id, id));

    // Update tags if provided
    if (updates.tags !== undefined) {
      await tx.delete(schema.beachTags).where(eq(schema.beachTags.beachId, id));
      if (updates.tags.length > 0) {
        await tx.insert(schema.beachTags).values(
          updates.tags.map(tag => ({ beachId: id, tag }))
        );
      }
    }

    // Update amenities if provided
    if (updates.amenities !== undefined) {
      await tx.delete(schema.beachAmenities).where(eq(schema.beachAmenities.beachId, id));
      if (updates.amenities.length > 0) {
        await tx.insert(schema.beachAmenities).values(
          updates.amenities.map(amenity => ({ beachId: id, amenity }))
        );
      }
    }

    // Update gallery if provided
    if (updates.gallery !== undefined) {
      await tx.delete(schema.beachGallery).where(eq(schema.beachGallery.beachId, id));
      if (updates.gallery.length > 0) {
        await tx.insert(schema.beachGallery).values(
          updates.gallery.map((imageUrl, index) => ({
            beachId: id,
            imageUrl,
            position: index
          }))
        );
      }
    }

    // Update aliases if provided
    if (updates.aliases !== undefined) {
      await tx.delete(schema.beachAliases).where(eq(schema.beachAliases.beachId, id));
      if (updates.aliases.length > 0) {
        await tx.insert(schema.beachAliases).values(
          updates.aliases.map(alias => ({ beachId: id, alias }))
        );
      }
    }

    // Update features if provided
    if (updates.features !== undefined) {
      await tx.delete(schema.beachFeatures).where(eq(schema.beachFeatures.beachId, id));
      if (updates.features.length > 0) {
        await tx.insert(schema.beachFeatures).values(
          updates.features.map((feature, index) => ({
            beachId: id,
            title: feature.title,
            description: feature.description,
            position: index
          }))
        );
      }
    }

    // Update tips if provided
    if (updates.tips !== undefined) {
      await tx.delete(schema.beachTips).where(eq(schema.beachTips.beachId, id));
      if (updates.tips.length > 0) {
        await tx.insert(schema.beachTips).values(
          updates.tips.map((tip, index) => ({
            beachId: id,
            category: tip.category,
            tip: tip.tip,
            position: index
          }))
        );
      }
    }

    // Audit log
    const afterHash = generateDataHash({ ...mapBeachRow(beach), ...updates } as Beach);
    await tx.insert(schema.beachAuditLog).values({
      timestamp: now,
      adminUser: options.adminUser || 'unknown',
      action: 'UPDATE',
      beachId: id,
      beforeHash,
      afterHash,
      duplicateDecision: options.duplicateDecision,
      ipAddress: options.ipAddress
    });

    // Return updated beach
    const updatedRow = await tx.query.beaches.findFirst({
      where: eq(schema.beaches.id, id)
    });

    if (!updatedRow) return null;

    const [tags, amenities, gallery, aliases, features, tips] = await Promise.all([
      tx.select().from(schema.beachTags).where(eq(schema.beachTags.beachId, id)),
      tx.select().from(schema.beachAmenities).where(eq(schema.beachAmenities.beachId, id)),
      tx.select().from(schema.beachGallery).where(eq(schema.beachGallery.beachId, id)).orderBy(schema.beachGallery.position),
      tx.select().from(schema.beachAliases).where(eq(schema.beachAliases.beachId, id)),
      tx.select().from(schema.beachFeatures).where(eq(schema.beachFeatures.beachId, id)).orderBy(schema.beachFeatures.position),
      tx.select().from(schema.beachTips).where(eq(schema.beachTips.beachId, id)).orderBy(schema.beachTips.position)
    ]);

    const updatedBeach = mapBeachRow(updatedRow);
    updatedBeach.tags = tags.map(t => t.tag) as Beach['tags'];
    updatedBeach.amenities = amenities.map(a => a.amenity) as Beach['amenities'];
    updatedBeach.gallery = gallery.map(g => g.imageUrl);
    updatedBeach.aliases = aliases.map(a => a.alias);
    updatedBeach.features = features.map(f => ({ title: f.title, description: f.description }));
    updatedBeach.tips = tips.map(t => ({ category: t.category, tip: t.tip }));

    return updatedBeach;
  });
}

export async function deleteBeach(
  id: string,
  options: { adminUser?: string; ipAddress?: string } = {}
): Promise<boolean> {
  const beach = await db.query.beaches.findFirst({ where: eq(schema.beaches.id, id) });

  if (!beach) {
    return false;
  }

  const beforeHash = generateDataHash(mapBeachRow(beach));

  await db.transaction(async (tx) => {
    // Audit log before deletion
    await tx.insert(schema.beachAuditLog).values({
      timestamp: new Date().toISOString(),
      adminUser: options.adminUser || 'unknown',
      action: 'DELETE',
      beachId: id,
      beforeHash,
      ipAddress: options.ipAddress
    });

    // Delete beach (cascade will handle related tables)
    await tx.delete(schema.beaches).where(eq(schema.beaches.id, id));
  });

  return true;
}
