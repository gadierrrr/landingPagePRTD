import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { db, schema } from '../db/client';
import { sql } from 'drizzle-orm';

interface DealJson {
  id: string;
  slug: string;
  title: string;
  description: string;
  amountLabel: string;
  location: string;
  image: string;
  category: string;
  expiry?: string;
  partner?: string;
  externalUrl?: string;
  fullDescription?: string;
  terms?: string;
  expiresAt?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  sourceName?: string;
  updatedAt?: string;
  gallery?: string[];
  highlights?: string[];
  howTo?: string[];
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'deals.json');
  const raw = await readFile(dataPath, 'utf8');
  const deals: DealJson[] = JSON.parse(raw);

  await db.transaction(async tx => {
    await tx.delete(schema.dealGallery);
    await tx.delete(schema.dealHighlights);
    await tx.delete(schema.dealHowToSteps);
    await tx.delete(schema.deals);

    for (const deal of deals) {
      await tx.insert(schema.deals).values({
        id: deal.id,
        slug: deal.slug,
        title: deal.title,
        description: deal.description,
        amountLabel: deal.amountLabel,
        location: deal.location,
        image: deal.image,
        category: deal.category,
        expiry: deal.expiry,
        partner: deal.partner,
        externalUrl: deal.externalUrl,
        fullDescription: deal.fullDescription,
        terms: deal.terms,
        expiresAt: deal.expiresAt,
        price: deal.price,
        originalPrice: deal.originalPrice,
        currency: deal.currency,
        sourceName: deal.sourceName,
        updatedAt: deal.updatedAt ?? sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      });

      if (deal.gallery?.length) {
        await tx.insert(schema.dealGallery).values(
          deal.gallery.map((imageUrl, index) => ({
            dealId: deal.id,
            imageUrl,
            position: index
          }))
        );
      }

      if (deal.highlights?.length) {
        await tx.insert(schema.dealHighlights).values(
          deal.highlights.map((highlight, index) => ({
            dealId: deal.id,
            highlight,
            position: index
          }))
        );
      }

      if (deal.howTo?.length) {
        await tx.insert(schema.dealHowToSteps).values(
          deal.howTo.map((step, index) => ({
            dealId: deal.id,
            step,
            position: index
          }))
        );
      }
    }
  });

  console.log(`Imported ${deals.length} deals`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
