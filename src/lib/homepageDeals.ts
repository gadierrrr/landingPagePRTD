import { Deal } from './forms';
import { isExpired } from './dealUtils';

/**
 * Select deals for the homepage deals summary section
 * Returns 4-6 deals excluding expired ones, with even distribution across categories
 */
export function selectHomepageDeals(allDeals: Deal[], targetCount = 6): Deal[] {
  // Filter out expired deals
  const activeDeals = allDeals.filter(deal => !isExpired(deal.expiresAt || deal.expiry));
  
  if (activeDeals.length === 0) {
    return [];
  }
  
  // Group deals by category
  const categories = ['hotel', 'restaurant', 'activity', 'tour'] as const;
  const dealsByCategory: Record<string, Deal[]> = {};
  const otherDeals: Deal[] = [];
  
  for (const deal of activeDeals) {
    if (categories.includes(deal.category as typeof categories[number])) {
      if (!dealsByCategory[deal.category]) {
        dealsByCategory[deal.category] = [];
      }
      dealsByCategory[deal.category].push(deal);
    } else {
      otherDeals.push(deal);
    }
  }
  
  // Sort deals within each category by updatedAt desc (most recent first)
  for (const category in dealsByCategory) {
    dealsByCategory[category].sort((a, b) => {
      const aUpdated = a.updatedAt || '1970-01-01';
      const bUpdated = b.updatedAt || '1970-01-01';
      return new Date(bUpdated).getTime() - new Date(aUpdated).getTime();
    });
  }
  
  // Sort other deals by updatedAt desc
  otherDeals.sort((a, b) => {
    const aUpdated = a.updatedAt || '1970-01-01';
    const bUpdated = b.updatedAt || '1970-01-01';
    return new Date(bUpdated).getTime() - new Date(aUpdated).getTime();
  });
  
  const selectedDeals: Deal[] = [];
  const usedVendors = new Set<string>();
  
  // Round 1: Try to get one deal from each category, avoiding duplicate vendors
  for (const category of categories) {
    const categoryDeals = dealsByCategory[category] || [];
    const availableDeal = categoryDeals.find(deal => {
      const vendor = extractVendor(deal.externalUrl, deal.sourceName);
      return !vendor || !usedVendors.has(vendor);
    });
    
    if (availableDeal && selectedDeals.length < targetCount) {
      selectedDeals.push(availableDeal);
      const vendor = extractVendor(availableDeal.externalUrl, availableDeal.sourceName);
      if (vendor) usedVendors.add(vendor);
    }
  }
  
  // Round 2: Fill remaining slots with most recent deals, still avoiding duplicate vendors when possible
  const remainingDeals = [
    ...Object.values(dealsByCategory).flat(),
    ...otherDeals
  ].filter(deal => !selectedDeals.includes(deal));
  
  remainingDeals.sort((a, b) => {
    const aUpdated = a.updatedAt || '1970-01-01';
    const bUpdated = b.updatedAt || '1970-01-01';
    return new Date(bUpdated).getTime() - new Date(aUpdated).getTime();
  });
  
  for (const deal of remainingDeals) {
    if (selectedDeals.length >= targetCount) break;
    
    const vendor = extractVendor(deal.externalUrl, deal.sourceName);
    if (!vendor || !usedVendors.has(vendor)) {
      selectedDeals.push(deal);
      if (vendor) usedVendors.add(vendor);
    }
  }
  
  // Round 3: If we still don't have enough deals, add remaining deals regardless of vendor
  if (selectedDeals.length < Math.min(targetCount, activeDeals.length)) {
    for (const deal of remainingDeals) {
      if (selectedDeals.length >= targetCount) break;
      if (!selectedDeals.includes(deal)) {
        selectedDeals.push(deal);
      }
    }
  }
  
  return selectedDeals;
}

/**
 * Extract vendor name from external URL or source name for deduplication
 */
function extractVendor(externalUrl?: string, sourceName?: string): string | null {
  if (sourceName) return sourceName.toLowerCase();
  
  if (!externalUrl) return null;
  
  try {
    const url = new URL(externalUrl);
    let hostname = url.hostname.toLowerCase();
    hostname = hostname.replace(/^www\./, '');
    return hostname;
  } catch {
    return null;
  }
}