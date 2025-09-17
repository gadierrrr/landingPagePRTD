// Feature flags for homepage redesign sections
export const HOMEPAGE_FEATURES = {
  ENHANCED_HERO: true,
  FEATURED_DEAL: true,
  UNDER_50_CAROUSEL: true,
  GUIDES_SECTION: true,
  WAVE_DIVIDERS: true
} as const;

export const getFeatureFlag = (flag: keyof typeof HOMEPAGE_FEATURES): boolean => {
  return HOMEPAGE_FEATURES[flag] ?? false;
};

export type FeatureFlag = keyof typeof HOMEPAGE_FEATURES;