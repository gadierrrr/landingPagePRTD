import { promises as fs } from 'fs';
import { join } from 'path';
import { Deal } from './forms';
import { generateSlug } from './slugGenerator';

const DEALS_FILE = join(process.cwd(), 'data', 'deals.json');
const DEALS_FILE_TMP = join(process.cwd(), 'data', 'deals.json.tmp');

export async function readDeals(): Promise<Deal[]> {
  try {
    const data = await fs.readFile(DEALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function writeDeals(deals: Deal[]): Promise<void> {
  const data = JSON.stringify(deals, null, 2);
  
  // Atomic write: write to temp file, then rename
  await fs.writeFile(DEALS_FILE_TMP, data, 'utf8');
  await fs.rename(DEALS_FILE_TMP, DEALS_FILE);
}

export async function addDeal(deal: Omit<Deal, 'id' | 'slug'>): Promise<Deal> {
  const deals = await readDeals();
  const existingSlugs = deals.map(d => d.slug).filter(Boolean) as string[];
  
  const newDeal: Deal = {
    ...deal,
    id: crypto.randomUUID(),
    slug: generateSlug(deal.title, existingSlugs),
    updatedAt: new Date().toISOString(),
    // Set defaults for new optional fields
    gallery: deal.gallery || [deal.image],
    fullDescription: deal.fullDescription || deal.description,
    highlights: deal.highlights || [],
    terms: deal.terms || '',
    currency: deal.currency || 'USD'
  };
  deals.push(newDeal);
  await writeDeals(deals);
  return newDeal;
}

export async function updateDeal(id: string, updates: Partial<Omit<Deal, 'id' | 'slug'>>): Promise<Deal | null> {
  const deals = await readDeals();
  const index = deals.findIndex(deal => deal.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Preserve the slug - it should never change once set  
  const { slug: _unused, ...safeUpdates } = updates as Partial<Deal>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _unused; // Acknowledge the unused variable
  
  // Always update the updatedAt timestamp on edits
  deals[index] = { ...deals[index], ...safeUpdates, updatedAt: new Date().toISOString() };
  await writeDeals(deals);
  return deals[index];
}

export async function deleteDeal(id: string): Promise<boolean> {
  const deals = await readDeals();
  const initialLength = deals.length;
  const filteredDeals = deals.filter(deal => deal.id !== id);
  
  if (filteredDeals.length === initialLength) {
    return false;
  }
  
  await writeDeals(filteredDeals);
  return true;
}

export async function getDealBySlug(slug: string): Promise<Deal | null> {
  const deals = await readDeals();
  return deals.find(deal => deal.slug === slug) || null;
}

export async function getDealById(id: string): Promise<Deal | null> {
  const deals = await readDeals();
  return deals.find(deal => deal.id === id) || null;
}

export async function migrateDealsForSlugs(): Promise<void> {
  const deals = await readDeals();
  const existingSlugs: string[] = [];
  let hasChanges = false;
  const migrationTimestamp = new Date().toISOString();
  
  for (const deal of deals) {
    // Generate slug if missing
    if (!deal.slug) {
      deal.slug = generateSlug(deal.title, existingSlugs);
      existingSlugs.push(deal.slug);
      hasChanges = true;
    } else {
      existingSlugs.push(deal.slug);
    }
    
    // Set updatedAt for existing deals (idempotent - only if missing)
    if (!deal.updatedAt) {
      deal.updatedAt = migrationTimestamp;
      hasChanges = true;
    }
    
    // Set defaults for new optional fields if missing
    if (!deal.gallery) {
      deal.gallery = [deal.image];
      hasChanges = true;
    }
    if (!deal.fullDescription) {
      deal.fullDescription = deal.description;
      hasChanges = true;
    }
    if (!deal.highlights) {
      deal.highlights = [];
      hasChanges = true;
    }
    if (!deal.terms) {
      deal.terms = '';
      hasChanges = true;
    }
    if (!deal.currency) {
      deal.currency = 'USD';
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    await writeDeals(deals);
    console.log(`Migrated ${deals.length} deals with slugs and new fields`);
  }
}