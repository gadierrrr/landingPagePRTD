/**
 * Configuration for popular beaches to pre-render at build time
 * Other beaches will be rendered on-demand via fallback: 'blocking'
 */

// Top tourist destination municipalities - limited to ~50-60 beaches total
export const POPULAR_MUNICIPALITIES = [
  'San Juan',      // 10 beaches
  'Culebra',       // 12 beaches (Flamenco, etc.)
  'Vieques',       // 19 beaches
  'Rincón',        // 11 beaches (surf capital)
  'Fajardo',       // 8 beaches (bioluminescent bay)
  'Luquillo'       // 5 beaches (Luquillo Beach)
  // Total: ~65 beaches from these municipalities
];

// High-value tags that indicate must-see beaches
export const POPULAR_TAGS = [
  'surfing',
  'snorkeling'
  // Removed 'family-friendly' as it's too broad
];

/**
 * Determine if a beach should be pre-rendered based on popularity criteria
 * Only pre-renders beaches in popular tourist municipalities
 */
export function isPopularBeach(beach: {
  municipality: string;
  tags?: string[];
}): boolean {
  // Only pre-render if in popular municipality
  // Tags alone are not enough (too many beaches have surfing/snorkeling tags)
  return POPULAR_MUNICIPALITIES.includes(beach.municipality);
}
