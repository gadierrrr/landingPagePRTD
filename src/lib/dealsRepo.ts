import { eq, inArray } from 'drizzle-orm';
import { db, schema } from './db';
import type { Deal } from './forms';

function mapDealRow(row: typeof schema.deals.$inferSelect): Deal {
  const deal: Deal = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    amountLabel: row.amountLabel,
    location: row.location,
    image: row.image,
    category: row.category as Deal['category'],
    currency: (row.currency as Deal['currency']) ?? 'USD',
    gallery: [],
    highlights: [],
    howTo: []
  };

  // Only add optional fields if they have values
  if (row.expiry) deal.expiry = row.expiry;
  if (row.partner) deal.partner = row.partner;
  if (row.externalUrl) deal.externalUrl = row.externalUrl;
  if (row.fullDescription) deal.fullDescription = row.fullDescription;
  if (row.terms) deal.terms = row.terms;
  if (row.expiresAt) deal.expiresAt = row.expiresAt;
  if (row.price !== null && row.price !== undefined) deal.price = row.price;
  if (row.originalPrice !== null && row.originalPrice !== undefined) deal.originalPrice = row.originalPrice;
  if (row.sourceName) deal.sourceName = row.sourceName;
  if (row.updatedAt) deal.updatedAt = row.updatedAt;

  return deal;
}

export async function getAllDeals(): Promise<Deal[]> {
  const dealRows = await db.select().from(schema.deals);
  if (dealRows.length === 0) return [];

  const ids = dealRows.map(d => d.id);

  const [galleryRows, highlightRows, howToRows] = await Promise.all([
    db
      .select()
      .from(schema.dealGallery)
      .where(inArray(schema.dealGallery.dealId, ids))
      .orderBy(schema.dealGallery.dealId, schema.dealGallery.position),
    db
      .select()
      .from(schema.dealHighlights)
      .where(inArray(schema.dealHighlights.dealId, ids))
      .orderBy(schema.dealHighlights.dealId, schema.dealHighlights.position),
    db
      .select()
      .from(schema.dealHowToSteps)
      .where(inArray(schema.dealHowToSteps.dealId, ids))
      .orderBy(schema.dealHowToSteps.dealId, schema.dealHowToSteps.position)
  ]);

  const galleryById = new Map<string, string[]>();
  for (const img of galleryRows) {
    const arr = galleryById.get(img.dealId) ?? [];
    arr.push(img.imageUrl);
    galleryById.set(img.dealId, arr);
  }

  const highlightsById = new Map<string, string[]>();
  for (const highlight of highlightRows) {
    const arr = highlightsById.get(highlight.dealId) ?? [];
    arr.push(highlight.highlight);
    highlightsById.set(highlight.dealId, arr);
  }

  const howToById = new Map<string, string[]>();
  for (const step of howToRows) {
    const arr = howToById.get(step.dealId) ?? [];
    arr.push(step.step);
    howToById.set(step.dealId, arr);
  }

  return dealRows.map(row => {
    const deal = mapDealRow(row);
    deal.gallery = galleryById.get(row.id) ?? [row.image];
    deal.highlights = highlightsById.get(row.id) ?? [];
    deal.howTo = howToById.get(row.id) ?? [];
    return deal;
  });
}

export async function getDealBySlug(slug: string): Promise<Deal | null> {
  const row = await db.query.deals.findFirst({ where: eq(schema.deals.slug, slug) });
  if (!row) return null;

  const deal = mapDealRow(row);

  const [gallery, highlights, howTo] = await Promise.all([
    db
      .select()
      .from(schema.dealGallery)
      .where(eq(schema.dealGallery.dealId, row.id))
      .orderBy(schema.dealGallery.position),
    db
      .select()
      .from(schema.dealHighlights)
      .where(eq(schema.dealHighlights.dealId, row.id))
      .orderBy(schema.dealHighlights.position),
    db
      .select()
      .from(schema.dealHowToSteps)
      .where(eq(schema.dealHowToSteps.dealId, row.id))
      .orderBy(schema.dealHowToSteps.position)
  ]);

  deal.gallery = gallery.length ? gallery.map(g => g.imageUrl) : [row.image];
  deal.highlights = highlights.map(h => h.highlight);
  deal.howTo = howTo.map(h => h.step);

  return deal;
}

export async function getDealById(id: string): Promise<Deal | null> {
  const row = await db.query.deals.findFirst({ where: eq(schema.deals.id, id) });
  if (!row) return null;
  return getDealBySlug(row.slug);
}

/**
 * Create a new deal with related data
 */
export async function createDeal(deal: Omit<Deal, 'id'>): Promise<Deal> {
  return db.transaction(async (tx) => {
    // Generate ID and slug
    const dealId = crypto.randomUUID();
    const slug = deal.slug || deal.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [newDeal] = await tx
      .insert(schema.deals)
      .values({
        id: dealId,
        slug,
        title: deal.title,
        description: deal.description,
        amountLabel: deal.amountLabel,
        location: deal.location,
        image: deal.image,
        category: deal.category,
        expiry: deal.expiry ?? null,
        partner: deal.partner ?? null,
        externalUrl: deal.externalUrl ?? null,
        fullDescription: deal.fullDescription ?? null,
        terms: deal.terms ?? null,
        expiresAt: deal.expiresAt ?? null,
        price: deal.price ?? null,
        originalPrice: deal.originalPrice ?? null,
        currency: deal.currency ?? 'USD',
        sourceName: deal.sourceName ?? null
      })
      .returning();

    // Insert gallery images
    if (deal.gallery && deal.gallery.length > 0) {
      await tx.insert(schema.dealGallery).values(
        deal.gallery.map((imageUrl, index) => ({
          dealId: newDeal.id,
          imageUrl,
          position: index
        }))
      );
    }

    // Insert highlights
    if (deal.highlights && deal.highlights.length > 0) {
      await tx.insert(schema.dealHighlights).values(
        deal.highlights.map((highlight, index) => ({
          dealId: newDeal.id,
          highlight,
          position: index
        }))
      );
    }

    // Insert how-to steps
    if (deal.howTo && deal.howTo.length > 0) {
      await tx.insert(schema.dealHowToSteps).values(
        deal.howTo.map((step, index) => ({
          dealId: newDeal.id,
          step,
          position: index
        }))
      );
    }

    return getDealById(newDeal.id) as Promise<Deal>;
  });
}

/**
 * Update an existing deal
 */
export async function updateDeal(id: string, updates: Partial<Omit<Deal, 'id'>>): Promise<Deal | null> {
  return db.transaction(async (tx) => {
    // Check if deal exists
    const existing = await tx.query.deals.findFirst({ where: eq(schema.deals.id, id) });
    if (!existing) return null;

    // Update main deal record
    const updateData: Record<string, unknown> = {};
    if (updates.slug !== undefined) updateData.slug = updates.slug;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amountLabel !== undefined) updateData.amountLabel = updates.amountLabel;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.expiry !== undefined) updateData.expiry = updates.expiry;
    if (updates.partner !== undefined) updateData.partner = updates.partner;
    if (updates.externalUrl !== undefined) updateData.externalUrl = updates.externalUrl;
    if (updates.fullDescription !== undefined) updateData.fullDescription = updates.fullDescription;
    if (updates.terms !== undefined) updateData.terms = updates.terms;
    if (updates.expiresAt !== undefined) updateData.expiresAt = updates.expiresAt;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.originalPrice !== undefined) updateData.originalPrice = updates.originalPrice;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.sourceName !== undefined) updateData.sourceName = updates.sourceName;

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date().toISOString();
      await tx.update(schema.deals).set(updateData).where(eq(schema.deals.id, id));
    }

    // Update gallery if provided
    if (updates.gallery !== undefined) {
      await tx.delete(schema.dealGallery).where(eq(schema.dealGallery.dealId, id));
      if (updates.gallery.length > 0) {
        await tx.insert(schema.dealGallery).values(
          updates.gallery.map((imageUrl, index) => ({
            dealId: id,
            imageUrl,
            position: index
          }))
        );
      }
    }

    // Update highlights if provided
    if (updates.highlights !== undefined) {
      await tx.delete(schema.dealHighlights).where(eq(schema.dealHighlights.dealId, id));
      if (updates.highlights.length > 0) {
        await tx.insert(schema.dealHighlights).values(
          updates.highlights.map((highlight, index) => ({
            dealId: id,
            highlight,
            position: index
          }))
        );
      }
    }

    // Update how-to steps if provided
    if (updates.howTo !== undefined) {
      await tx.delete(schema.dealHowToSteps).where(eq(schema.dealHowToSteps.dealId, id));
      if (updates.howTo.length > 0) {
        await tx.insert(schema.dealHowToSteps).values(
          updates.howTo.map((step, index) => ({
            dealId: id,
            step,
            position: index
          }))
        );
      }
    }

    return getDealById(id);
  });
}

/**
 * Delete a deal and all related data
 */
export async function deleteDeal(id: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const existing = await tx.query.deals.findFirst({ where: eq(schema.deals.id, id) });
    if (!existing) return false;

    // Delete related data (cascade should handle this, but explicit is safer)
    await tx.delete(schema.dealGallery).where(eq(schema.dealGallery.dealId, id));
    await tx.delete(schema.dealHighlights).where(eq(schema.dealHighlights.dealId, id));
    await tx.delete(schema.dealHowToSteps).where(eq(schema.dealHowToSteps.dealId, id));

    // Delete main deal record
    await tx.delete(schema.deals).where(eq(schema.deals.id, id));

    return true;
  });
}
