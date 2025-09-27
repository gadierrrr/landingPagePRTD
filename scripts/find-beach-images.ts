#!/usr/bin/env npx tsx

import { promises as fs } from 'fs';
import { join } from 'path';
import { readBeaches, writeBeaches } from '../src/lib/beachesStore';
import { Beach } from '../src/lib/forms';

// Unsplash API configuration (free tier: 50 requests/hour)
const UNSPLASH_ACCESS_KEY = 'demo'; // We'll use demo mode for testing
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

// Pexels API configuration (free tier: 200 requests/hour)
const PEXELS_API_KEY = 'demo'; // We'll use demo mode for testing  
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

interface ImageResult {
  url: string;
  downloadUrl: string;
  description: string;
  tags: string[];
  source: 'unsplash' | 'pexels';
  score: number;
}

// Select diverse beaches for testing
const TEST_BEACHES = [
  'Flamenco Beach', // Famous beach - should get exact match
  'Crash Boat South (Almirante Beach)', // Well-known with alias
  'Boquerón Beach', // Spanish name
  'La Playuela (Playa Sucia)', // Has alias in parentheses
  'Gas Chambers', // Surfing spot with unique name
  'Wilderness', // Generic name needing location context
  'Jobos Beach', // Surfing beach
  'Survival / Playuela', // Complex name with slash
  'Cueva de las Golondrinas Cove', // Descriptive Spanish name
  'Buyé Beach', // Simple Spanish name
  'Montones Beach', // Family-friendly beach
  'Combate Beach', // Popular beach
  'Blue Hole Reef Access', // Diving spot
  'Aguada Malecón Strip', // Urban waterfront
  'Villa Pesquera (Isabela)' // Municipality-specific name
];

function buildSearchQueries(beach: Beach): string[] {
  const queries: string[] = [];
  
  // Clean the beach name
  const cleanName = beach.name.replace(/[()\/]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Extract alias if available
  const aliasMatch = beach.name.match(/\(([^)]+)\)/);
  const primaryAlias = aliasMatch ? aliasMatch[1] : beach.aliases?.[0];
  
  // Check if it's a well-known beach
  const wellKnownBeaches = ['Flamenco', 'Crash Boat', 'Boquerón', 'Combate', 'Buyé'];
  const isWellKnown = wellKnownBeaches.some(known => beach.name.includes(known));
  
  // Priority 1: Exact name + Puerto Rico (for well-known beaches)
  if (isWellKnown) {
    queries.push(`"${cleanName}" Puerto Rico`);
    queries.push(`"${cleanName}" beach Puerto Rico`);
  }
  
  // Priority 2: Use primary alias if available
  if (primaryAlias && primaryAlias !== cleanName) {
    queries.push(`"${primaryAlias}" Puerto Rico beach`);
    queries.push(`${primaryAlias} ${beach.municipality} Puerto Rico`);
  }
  
  // Priority 3: Name + municipality + Puerto Rico
  queries.push(`${cleanName} ${beach.municipality} Puerto Rico beach`);
  
  // Priority 4: Add activity context for better matching
  if (beach.tags.length > 0) {
    const primaryTag = beach.tags[0];
    queries.push(`${cleanName} ${primaryTag} Puerto Rico`);
    queries.push(`${beach.municipality} Puerto Rico ${primaryTag} beach`);
  }
  
  // Priority 5: Municipality-based fallback
  queries.push(`${beach.municipality} Puerto Rico tropical beach`);
  
  // Priority 6: Generic Puerto Rico beach (last resort)
  queries.push('Puerto Rico beach tropical paradise');
  
  return queries;
}

function scoreImageMatch(beach: Beach, query: string, imageData: any): number {
  let score = 0;
  const beachName = beach.name.toLowerCase();
  const municipality = beach.municipality.toLowerCase();
  const description = (imageData.description || imageData.alt || '').toLowerCase();
  const tags = imageData.tags || [];
  
  // Exact beach name match (highest priority)
  if (description.includes(beachName.split('(')[0].trim())) {
    score += 15;
  }
  
  // Municipality match
  if (description.includes(municipality) || tags.some((tag: string) => tag.includes(municipality))) {
    score += 10;
  }
  
  // Puerto Rico mention
  if (description.includes('puerto rico') || tags.some((tag: string) => tag.includes('puerto rico'))) {
    score += 8;
  }
  
  // Activity/tag matches
  beach.tags.forEach(tag => {
    if (description.includes(tag) || tags.some((t: string) => t.includes(tag))) {
      score += 3;
    }
  });
  
  // Beach-related keywords
  const beachKeywords = ['beach', 'playa', 'coast', 'shore', 'tropical', 'caribbean', 'ocean', 'surf'];
  beachKeywords.forEach(keyword => {
    if (description.includes(keyword) || tags.some((t: string) => t.includes(keyword))) {
      score += 1;
    }
  });
  
  return score;
}

async function searchUnsplash(query: string): Promise<ImageResult | null> {
  try {
    // For demo purposes, we'll simulate API calls and use direct URLs
    console.log(`🔍 Searching Unsplash for: "${query}"`);
    
    // Simulate different responses based on query
    if (query.includes('Flamenco')) {
      return {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600',
        downloadUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&auto=format',
        description: 'Flamenco Beach, Culebra, Puerto Rico - crystal clear waters',
        tags: ['beach', 'puerto rico', 'culebra', 'tropical'],
        source: 'unsplash',
        score: 0
      };
    }
    
    if (query.includes('Crash Boat') || query.includes('Almirante')) {
      return {
        url: 'https://images.unsplash.com/photo-1516900448138-898720b936c7?w=800&h=600',
        downloadUrl: 'https://images.unsplash.com/photo-1516900448138-898720b936c7?w=800&h=600&auto=format',
        description: 'Crash Boat Beach pier in Aguadilla, Puerto Rico',
        tags: ['beach', 'puerto rico', 'aguadilla', 'pier'],
        source: 'unsplash',
        score: 0
      };
    }
    
    if (query.includes('Boquerón')) {
      return {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600',
        downloadUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&auto=format',
        description: 'Boquerón Beach, Cabo Rojo, Puerto Rico sunset',
        tags: ['beach', 'puerto rico', 'cabo rojo', 'sunset'],
        source: 'unsplash',
        score: 0
      };
    }
    
    if (query.includes('surfing') || query.includes('surf')) {
      return {
        url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=600',
        downloadUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=600&auto=format',
        description: 'Surfing beach in Puerto Rico with perfect waves',
        tags: ['beach', 'puerto rico', 'surfing', 'waves'],
        source: 'unsplash',
        score: 0
      };
    }
    
    // Generic Puerto Rico beach fallback
    return {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600',
      downloadUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&auto=format',
      description: 'Beautiful tropical beach in Puerto Rico',
      tags: ['beach', 'puerto rico', 'tropical', 'caribbean'],
      source: 'unsplash',
      score: 0
    };
    
  } catch (error) {
    console.error('Unsplash API error:', error);
    return null;
  }
}

async function searchPexels(query: string): Promise<ImageResult | null> {
  try {
    console.log(`🔍 Searching Pexels for: "${query}"`);
    
    // Simulate Pexels responses
    return {
      url: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?w=800&h=600',
      downloadUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?w=800&h=600&auto=compress',
      description: 'Tropical beach scene in Puerto Rico',
      tags: ['beach', 'tropical', 'caribbean'],
      source: 'pexels',
      score: 0
    };
    
  } catch (error) {
    console.error('Pexels API error:', error);
    return null;
  }
}

async function findBestImageForBeach(beach: Beach): Promise<ImageResult | null> {
  console.log(`\n🏖️  Processing: ${beach.name} (${beach.municipality})`);
  
  const queries = buildSearchQueries(beach);
  console.log(`📝 Generated ${queries.length} search queries`);
  
  let bestResult: ImageResult | null = null;
  let bestScore = 0;
  
  for (let i = 0; i < Math.min(queries.length, 3); i++) { // Limit to first 3 queries to respect rate limits
    const query = queries[i];
    
    // Try Unsplash first
    const unsplashResult = await searchUnsplash(query);
    if (unsplashResult) {
      unsplashResult.score = scoreImageMatch(beach, query, unsplashResult);
      console.log(`  📸 Unsplash result: "${unsplashResult.description}" (score: ${unsplashResult.score})`);
      
      if (unsplashResult.score > bestScore) {
        bestResult = unsplashResult;
        bestScore = unsplashResult.score;
      }
    }
    
    // Try Pexels as fallback
    if (!bestResult || bestScore < 10) {
      const pexelsResult = await searchPexels(query);
      if (pexelsResult) {
        pexelsResult.score = scoreImageMatch(beach, query, pexelsResult);
        console.log(`  📷 Pexels result: "${pexelsResult.description}" (score: ${pexelsResult.score})`);
        
        if (pexelsResult.score > bestScore) {
          bestResult = pexelsResult;
          bestScore = pexelsResult.score;
        }
      }
    }
    
    // If we found a high-quality match, stop searching
    if (bestScore >= 15) {
      console.log(`  ✅ Found excellent match, stopping search`);
      break;
    }
    
    // Rate limiting: wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (bestResult) {
    console.log(`  🎯 Best match: ${bestResult.source} (score: ${bestScore})`);
    console.log(`  🔗 URL: ${bestResult.downloadUrl}`);
  } else {
    console.log(`  ❌ No suitable image found`);
  }
  
  return bestResult;
}

async function downloadImage(imageResult: ImageResult, filename: string): Promise<boolean> {
  try {
    console.log(`  ⬇️  Downloading image: ${filename}`);
    
    const response = await fetch(imageResult.downloadUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const imagePath = join(process.cwd(), 'public', 'images', 'beaches', filename);
    
    await fs.writeFile(imagePath, Buffer.from(buffer));
    console.log(`  ✅ Saved: ${imagePath}`);
    
    return true;
  } catch (error) {
    console.error(`  ❌ Download failed:`, error);
    return false;
  }
}

function generateImageFilename(beach: Beach, imageResult: ImageResult): string {
  // Create SEO-friendly filename
  const cleanName = beach.name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  const extension = imageResult.downloadUrl.includes('.jpg') ? '.jpg' : '.jpeg';
  return `${cleanName}-${beach.municipality.toLowerCase()}${extension}`;
}

async function processTestBeaches() {
  console.log('🚀 Starting beach image search for test beaches...\n');
  
  // Load all beaches
  const allBeaches = await readBeaches();
  
  // Filter to test beaches
  const testBeaches = allBeaches.filter(beach => 
    TEST_BEACHES.some(testName => beach.name.includes(testName) || testName.includes(beach.name))
  );
  
  console.log(`📊 Found ${testBeaches.length} test beaches to process`);
  
  const results: Array<{ beach: Beach; success: boolean; imagePath?: string; score?: number }> = [];
  
  for (const beach of testBeaches) {
    const imageResult = await findBestImageForBeach(beach);
    
    if (imageResult) {
      const filename = generateImageFilename(beach, imageResult);
      const downloadSuccess = await downloadImage(imageResult, filename);
      
      if (downloadSuccess) {
        results.push({
          beach,
          success: true,
          imagePath: `/images/beaches/${filename}`,
          score: imageResult.score
        });
      } else {
        results.push({ beach, success: false });
      }
    } else {
      results.push({ beach, success: false });
    }
    
    // Rate limiting between beaches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary report
  console.log('\n📋 PROCESSING SUMMARY:');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length} beaches`);
  console.log(`❌ Failed: ${failed.length}/${results.length} beaches`);
  
  if (successful.length > 0) {
    console.log('\n🎯 SUCCESSFUL MATCHES:');
    successful.forEach(result => {
      console.log(`  ${result.beach.name} (${result.beach.municipality})`);
      console.log(`    → ${result.imagePath} (score: ${result.score})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED MATCHES:');
    failed.forEach(result => {
      console.log(`  ${result.beach.name} (${result.beach.municipality})`);
    });
  }
  
  console.log('\n🔄 Next steps:');
  console.log('1. Review downloaded images in public/images/beaches/');
  console.log('2. Update beach data with new image paths');
  console.log('3. Deploy and test results');
  console.log('4. Scale to remaining beaches');
  
  return results;
}

// Run the script
if (import.meta.url.endsWith(process.argv[1])) {
  processTestBeaches().catch(console.error);
}

export { processTestBeaches, findBestImageForBeach };