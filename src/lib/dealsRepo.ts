import { eq, inArray } from 'drizzle-orm';
import { db, schema } from './db';
import type { Deal } from './forms';

function mapDealRow(row: typeof schema.deals.$inferSelect): Deal {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    amountLabel: row.amountLabel,
    location: row.location,
    image: row.image,
    category: row.category as Deal['category'],
    expiry: row.expiry ?? undefined,
    partner: row.partner ?? undefined,
    externalUrl: row.externalUrl ?? undefined,
    fullDescription: row.fullDescription ?? undefined,
    terms: row.terms ?? undefined,
    expiresAt: row.expiresAt ?? undefined,
    price: row.price ?? undefined,
    originalPrice: row.originalPrice ?? undefined,
    currency: (row.currency as Deal['currency']) ?? 'USD',
    sourceName: row.sourceName ?? undefined,
    updatedAt: row.updatedAt ?? undefined,
    gallery: [],
    highlights: [],
    howTo: []
  };
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
