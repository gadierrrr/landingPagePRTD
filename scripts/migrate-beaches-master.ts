#!/usr/bin/env npx tsx

import { promises as fs } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { generateBeachSlug } from '../src/lib/slugGenerator';
import { TAGS, AMENITIES, CONDITION_SCALES, MUNICIPALITIES } from '../src/constants/beachVocab';

interface MasterBeach {
  name: string;
  municipality: string;
  coords: {
    lat: number;
    lng: number;
  };
  tags: string[];
  amenities: string[];
  aliases?: string[];
  notes?: string;
  sargassum?: string;
  surf?: string;
  wind?: string;
  accessLabel?: string;
}

interface StandardBeach {
  id: string;
  slug: string;
  name: string;
  municipality: string;
  coords: {
    lat: number;
    lng: number;
  };
  tags: string[];
  amenities: string[];
  sargassum?: string;
  surf?: string;
  wind?: string;
  coverImage: string;
  gallery?: string[];
  aliases?: string[];
  accessLabel?: string;
  notes?: string;
  updatedAt: string;
}

// Tag mapping from non-standard to standard vocabulary
const TAG_MAPPING: Record<string, string[]> = {
  'hike-in': ['secluded'],
  'reef': ['snorkeling', 'diving'],
  'bioluminescent': ['scenic'],
  'mangrove': ['scenic'],
  'protected': ['scenic'],
  'historic': ['scenic'],
  'caves': ['scenic'],
  'cliffs': ['scenic'],
  'rocky': ['scenic'],
  'black-sand': ['scenic'],
  'coral': ['snorkeling'],
  'lighthouse': ['scenic'],
  'pier': ['fishing'],
  'boat-access': ['secluded'],
  'ferry': ['accessible'],
  'windsurfing': ['surfing'],
  'kitesurfing': ['surfing'],
  'bodyboarding': ['surfing'],
  'shore-fishing': ['fishing'],
  'deep-fishing': ['fishing'],
  'spearfishing': ['diving'],
  'cliff-jumping': ['scenic'],
  'nature-reserve': ['scenic'],
  'bird-watching': ['scenic'],
  'kayaking': ['scenic'],
  'paddleboarding': ['calm-waters'],
  'jetski': ['swimming'],
  'boat-launch': ['accessible'],
  'marina': ['accessible']
};

// Amenity mapping from non-standard to standard vocabulary
const AMENITY_MAPPING: Record<string, string[]> = {
  'snack-bar': ['food'],
  'restaurant': ['food'],
  'bar': ['food'],
  'vendors': ['food'],
  'beach-chairs': ['shade-structures'],
  'umbrellas': ['shade-structures'],
  'gazebos': ['shade-structures'],
  'boardwalk': ['accessibility'],
  'ramp': ['accessibility'],
  'first-aid': ['lifeguard'],
  'security': ['lifeguard'],
  'gear-rental': ['equipment-rental'],
  'kayak-rental': ['equipment-rental'],
  'snorkel-rental': ['equipment-rental'],
  'chair-rental': ['equipment-rental']
};

function normalizeTag(tag: string): string[] {
  const normalizedTag = tag.toLowerCase().trim();
  
  // Check if it's already a valid tag
  if (TAGS.includes(normalizedTag as any)) {
    return [normalizedTag];
  }
  
  // Check mapping
  if (TAG_MAPPING[normalizedTag]) {
    return TAG_MAPPING[normalizedTag];
  }
  
  // Partial matches and fallbacks
  if (normalizedTag.includes('surf')) return ['surfing'];
  if (normalizedTag.includes('snorkel')) return ['snorkeling'];
  if (normalizedTag.includes('dive') || normalizedTag.includes('diving')) return ['diving'];
  if (normalizedTag.includes('swim')) return ['swimming'];
  if (normalizedTag.includes('family')) return ['family-friendly'];
  if (normalizedTag.includes('calm')) return ['calm-waters'];
  if (normalizedTag.includes('secluded') || normalizedTag.includes('remote')) return ['secluded'];
  if (normalizedTag.includes('popular') || normalizedTag.includes('crowded')) return ['popular'];
  if (normalizedTag.includes('scenic') || normalizedTag.includes('beautiful')) return ['scenic'];
  if (normalizedTag.includes('fish')) return ['fishing'];
  if (normalizedTag.includes('camp')) return ['camping'];
  if (normalizedTag.includes('accessible')) return ['accessible'];
  
  // Default fallback
  console.warn(`Unmapped tag: ${tag} -> defaulting to 'scenic'`);
  return ['scenic'];
}

function normalizeAmenity(amenity: string): string[] {
  const normalizedAmenity = amenity.toLowerCase().trim();
  
  // Check if it's already a valid amenity
  if (AMENITIES.includes(normalizedAmenity as any)) {
    return [normalizedAmenity];
  }
  
  // Check mapping
  if (AMENITY_MAPPING[normalizedAmenity]) {
    return AMENITY_MAPPING[normalizedAmenity];
  }
  
  // Partial matches and fallbacks
  if (normalizedAmenity.includes('toilet') || normalizedAmenity.includes('bathroom')) return ['restrooms'];
  if (normalizedAmenity.includes('shower')) return ['showers'];
  if (normalizedAmenity.includes('lifeguard') || normalizedAmenity.includes('guard')) return ['lifeguard'];
  if (normalizedAmenity.includes('park')) return ['parking'];
  if (normalizedAmenity.includes('food') || normalizedAmenity.includes('drink')) return ['food'];
  if (normalizedAmenity.includes('rental')) return ['equipment-rental'];
  if (normalizedAmenity.includes('accessible') || normalizedAmenity.includes('wheelchair')) return ['accessibility'];
  if (normalizedAmenity.includes('picnic')) return ['picnic-areas'];
  if (normalizedAmenity.includes('shade') || normalizedAmenity.includes('umbrella')) return ['shade-structures'];
  if (normalizedAmenity.includes('water-sport')) return ['water-sports'];
  
  // Skip unmapped amenities
  console.warn(`Unmapped amenity: ${amenity} -> skipping`);
  return [];
}

function normalizeCondition(value: string | undefined, type: 'sargassum' | 'surf' | 'wind'): string | undefined {
  if (!value) return undefined;
  
  const normalized = value.toLowerCase().trim();
  const validValues = CONDITION_SCALES[type];
  
  if ((validValues as readonly string[]).includes(normalized)) {
    return normalized;
  }
  
  // Fallback mappings
  switch (type) {
    case 'sargassum':
      if (normalized.includes('heavy') || normalized.includes('lots')) return 'heavy';
      if (normalized.includes('moderate') || normalized.includes('some')) return 'moderate';
      if (normalized.includes('light') || normalized.includes('little')) return 'light';
      return 'none';
    
    case 'surf':
      if (normalized.includes('large') || normalized.includes('big') || normalized.includes('huge')) return 'large';
      if (normalized.includes('medium') || normalized.includes('moderate')) return 'medium';
      if (normalized.includes('small') || normalized.includes('little')) return 'small';
      return 'calm';
    
    case 'wind':
      if (normalized.includes('strong') || normalized.includes('windy')) return 'strong';
      if (normalized.includes('moderate')) return 'moderate';
      if (normalized.includes('light') || normalized.includes('gentle')) return 'light';
      return 'calm';
  }
  
  return undefined;
}

async function migrateBeaches() {
  console.log('🏖️  Starting beaches migration...');
  
  // Read master file
  const masterFile = join(process.cwd(), 'data', 'beaches_master_merged.json');
  const masterData = await fs.readFile(masterFile, 'utf8');
  const masterBeaches: MasterBeach[] = JSON.parse(masterData);
  
  console.log(`📊 Processing ${masterBeaches.length} beaches from master file`);
  
  // Backup current beaches.json
  const currentFile = join(process.cwd(), 'data', 'beaches.json');
  const backupFile = join(process.cwd(), 'data', `beaches-backup-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.json`);
  
  try {
    await fs.copyFile(currentFile, backupFile);
    console.log(`💾 Backed up current beaches to: ${backupFile}`);
  } catch (error) {
    console.log('ℹ️  No existing beaches.json to backup');
  }
  
  const standardBeaches: StandardBeach[] = [];
  const existingSlugs: string[] = [];
  const timestamp = new Date().toISOString();
  
  let tagMappings = 0;
  let amenityMappings = 0;
  
  for (const beach of masterBeaches) {
    // Validate municipality
    if (!MUNICIPALITIES.includes(beach.municipality as any)) {
      console.warn(`⚠️  Skipping beach ${beach.name} - invalid municipality: ${beach.municipality}`);
      continue;
    }
    
    // Generate ID and slug
    const id = crypto.randomUUID();
    const slug = generateBeachSlug(beach.name, beach.municipality, beach.coords, existingSlugs);
    existingSlugs.push(slug);
    
    // Normalize tags
    const normalizedTags: string[] = [];
    for (const tag of beach.tags || []) {
      const mapped = normalizeTag(tag);
      normalizedTags.push(...mapped);
      if (!TAGS.includes(tag as any)) {
        tagMappings++;
      }
    }
    
    // Remove duplicates and ensure valid tags
    const uniqueTags = [...new Set(normalizedTags)].filter(tag => TAGS.includes(tag as any));
    
    // Normalize amenities
    const normalizedAmenities: string[] = [];
    for (const amenity of beach.amenities || []) {
      const mapped = normalizeAmenity(amenity);
      normalizedAmenities.push(...mapped);
      if (!AMENITIES.includes(amenity as any)) {
        amenityMappings++;
      }
    }
    
    // Remove duplicates and ensure valid amenities
    const uniqueAmenities = [...new Set(normalizedAmenities)].filter(amenity => AMENITIES.includes(amenity as any));
    
    const standardBeach: StandardBeach = {
      id,
      slug,
      name: beach.name,
      municipality: beach.municipality,
      coords: beach.coords,
      tags: uniqueTags,
      amenities: uniqueAmenities,
      sargassum: normalizeCondition(beach.sargassum, 'sargassum'),
      surf: normalizeCondition(beach.surf, 'surf'),
      wind: normalizeCondition(beach.wind, 'wind'),
      coverImage: '/images/beaches/placeholder-beach.jpg', // Generic placeholder
      gallery: [],
      aliases: beach.aliases,
      accessLabel: beach.accessLabel,
      notes: beach.notes,
      updatedAt: timestamp
    };
    
    standardBeaches.push(standardBeach);
  }
  
  // Write migrated data
  const outputData = JSON.stringify(standardBeaches, null, 2);
  await fs.writeFile(currentFile, outputData, 'utf8');
  
  console.log(`✅ Migration complete!`);
  console.log(`📈 Migrated ${standardBeaches.length} beaches`);
  console.log(`🏷️  Mapped ${tagMappings} non-standard tags`);
  console.log(`🛠️  Mapped ${amenityMappings} non-standard amenities`);
  console.log(`💾 New data saved to: ${currentFile}`);
  console.log(`📦 Backup saved to: ${backupFile}`);
  
  // Generate summary stats
  const municipalityStats = standardBeaches.reduce((acc, beach) => {
    acc[beach.municipality] = (acc[beach.municipality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`\n📊 Beaches by municipality:`);
  Object.entries(municipalityStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([municipality, count]) => {
      console.log(`   ${municipality}: ${count}`);
    });
}

// Run migration
migrateBeaches().catch(console.error);