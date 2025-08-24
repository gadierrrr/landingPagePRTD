/**
 * Utility functions for deal processing and display
 */

/**
 * Check if a deal has expired
 */
export function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  try {
    return new Date(expiresAt) < new Date();
  } catch {
    return false;
  }
}

/**
 * Get display-friendly source name from external URL or explicit sourceName
 */
export function displaySourceName(externalUrl?: string, sourceName?: string): string | null {
  if (sourceName) return sourceName;
  
  if (!externalUrl) return null;
  
  try {
    const url = new URL(externalUrl);
    let hostname = url.hostname.toLowerCase();
    
    // Remove www. prefix
    hostname = hostname.replace(/^www\./, '');
    
    // Handle known sources
    const knownSources: Record<string, string> = {
      'groupon.com': 'Groupon',
      'viator.com': 'Viator',
      'expedia.com': 'Expedia',
      'booking.com': 'Booking.com',
      'airbnb.com': 'Airbnb',
      'tripadvisor.com': 'TripAdvisor'
    };
    
    if (knownSources[hostname]) {
      return knownSources[hostname];
    }
    
    // Capitalize first letter for unknown sources
    return hostname.charAt(0).toUpperCase() + hostname.slice(1);
  } catch {
    return null;
  }
}

/**
 * Append UTM parameters to external URL for tracking
 */
export function appendUtm(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', 'PRTD');
    urlObj.searchParams.set('utm_medium', 'referral');
    urlObj.searchParams.set('utm_campaign', 'deal_page');
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original URL
    return url;
  }
}

/**
 * Format relative time for "Updated X days ago"
 */
export function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'recently';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}

/**
 * Format date for "Ends MMM d" display
 */
export function formatEndDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}