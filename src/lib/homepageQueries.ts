import { Deal } from './forms';
import { readDeals } from './dealsStore';
import { isExpired } from './dealUtils';
import { getAllPostsMeta } from './blog';

// Get a featured deal (prioritize deals with hot badge, then latest)
export async function getFeaturedDeal(): Promise<Deal | null> {
  try {
    const deals = await readDeals();
    const activeDeals = deals.filter(deal => !isExpired(deal.expiresAt || deal.expiry));
    
    if (activeDeals.length === 0) return null;
    
    // Look for deals that might be marked as "hot" or featured
    // For now, we'll use the most recently updated deal
    const sortedDeals = activeDeals.sort((a, b) => {
      const dateA = new Date(a.updatedAt || '').getTime();
      const dateB = new Date(b.updatedAt || '').getTime();
      return dateB - dateA;
    });
    
    return sortedDeals[0];
  } catch (error) {
    console.error('Error fetching featured deal:', error);
    return null;
  }
}

// Get latest deals for the main grid
export async function getLatestDeals(limit: number = 9): Promise<Deal[]> {
  try {
    const deals = await readDeals();
    const activeDeals = deals.filter(deal => !isExpired(deal.expiresAt || deal.expiry));
    
    return activeDeals
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || '').getTime();
        const dateB = new Date(b.updatedAt || '').getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching latest deals:', error);
    return [];
  }
}

// Get deals under $50 for the carousel
export async function getUnder50Deals(): Promise<Deal[]> {
  try {
    const deals = await readDeals();
    return deals.filter(deal => {
      if (isExpired(deal.expiresAt || deal.expiry)) return false;
      
      // Check if deal has a price under $50
      if (deal.price && deal.price <= 50) return true;
      
      // Also check if amountLabel suggests under $50
      const amountText = deal.amountLabel.toLowerCase();
      if (amountText.includes('$') && amountText.includes('50')) {
        // Extract price from amountLabel if possible
        const priceMatch = amountText.match(/\$(\d+)/);
        if (priceMatch) {
          const price = parseInt(priceMatch[1]);
          return price <= 50;
        }
      }
      
      // Include deals with percentage discounts that might indicate affordability
      return amountText.includes('%') && (
        amountText.includes('50') || 
        amountText.includes('60') || 
        amountText.includes('70')
      );
    });
  } catch (error) {
    console.error('Error fetching under $50 deals:', error);
    return [];
  }
}

// Get featured guides (reuse blog posts as guides)
interface Guide {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags?: string[];
  publishDate?: string;
}

export async function getFeaturedGuides(limit: number = 6): Promise<Guide[]> {
  try {
    const posts = await getAllPostsMeta();
    return posts.slice(0, limit).map(post => ({
      id: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      tags: post.tags || [],
      publishDate: post.publishDate
    }));
  } catch (error) {
    console.error('Error fetching featured guides:', error);
    return [];
  }
}

// Get hero background images
export function getHeroBackgrounds(): string[] {
  return [
    '/images/uploads/2025/08/copamarina-beach-resort-1756152657533.jpg', // Beach
    '/images/uploads/2025/09/FairmontHotel-1757084065163.jpg', // Hotel/Rainforest
    '/images/uploads/2025/08/galleryinn-osj-1756166538791.jpg' // Old San Juan
  ];
}

// Determine badges for deals
export function getDealBadges(deal: Deal): ('hot' | 'editor')[] {
  const badges: ('hot' | 'editor')[] = [];
  
  // Mark recent deals as "hot"
  if (deal.updatedAt) {
    const daysSinceUpdate = (Date.now() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate <= 3) {
      badges.push('hot');
    }
  }
  
  // Mark deals with high discounts as "editor's pick"
  if (deal.amountLabel.includes('%')) {
    const percentMatch = deal.amountLabel.match(/(\d+)%/);
    if (percentMatch) {
      const percent = parseInt(percentMatch[1]);
      if (percent >= 40) {
        badges.push('editor');
      }
    }
  }
  
  return badges;
}