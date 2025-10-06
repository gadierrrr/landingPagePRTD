#!/usr/bin/env node
/**
 * Beach Image Matcher
 * Intelligently matches uploaded images to beach database records
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database('./data/prtd.sqlite');

// Normalize string for comparison
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '');
}

// Calculate string similarity (Levenshtein-based)
function similarity(str1, str2) {
  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (s1 === s2) return 1.0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const distance = levenshtein(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshtein(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      const indicator = str1[j - 1] === str2[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1,
        matrix[i - 1][j - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Get all beaches from database
const beaches = db.prepare(`
  SELECT id, slug, name, municipality, cover_image
  FROM beaches
`).all();

console.log(`\n📊 Loaded ${beaches.length} beaches from database\n`);

// Scan for uploaded images
const uploads2509 = fs.readdirSync('public/images/uploads/2025/09')
  .filter(f => f.match(/\.(jpg|jpeg|webp|png)$/i) &&
    (f.includes('beach') || f.includes('playa') || f.includes('cayo') ||
     f.includes('punta') || f.includes('isla-')));

const uploads2510 = fs.readdirSync('public/images/uploads/2025/10')
  .filter(f => f.match(/\.(jpg|jpeg|webp|png)$/i) &&
    (f.includes('beach') || f.includes('playa') || f.includes('cayo') ||
     f.includes('punta')));

const allUploads = [
  ...uploads2509.map(f => ({ file: f, path: `/images/uploads/2025/09/${f}` })),
  ...uploads2510.map(f => ({ file: f, path: `/images/uploads/2025/10/${f}` }))
];

console.log(`🖼️  Found ${allUploads.length} uploaded beach images\n`);

// Match images to beaches
const matches = [];

allUploads.forEach(upload => {
  // Extract beach name and municipality from filename
  const fileBase = upload.file.split('-').slice(0, -1).join('-')
    .replace(/beach|playa|sbeach/gi, '')
    .trim();

  const fileNorm = normalize(fileBase);

  // Find best matching beach
  let bestMatch = null;
  let bestScore = 0;

  beaches.forEach(beach => {
    const beachNorm = normalize(beach.name);
    const municipalityNorm = normalize(beach.municipality);
    const slugNorm = normalize(beach.slug.split('-').slice(0, -2).join('-'));

    // Calculate scores
    let score = 0;

    // Direct name match
    const nameScore = similarity(fileNorm, beachNorm);
    score += nameScore * 100;

    // Check if file contains municipality
    if (fileNorm.includes(municipalityNorm)) {
      score += 20;
    }

    // Check if file matches slug pattern
    const slugScore = similarity(fileNorm, slugNorm);
    score += slugScore * 50;

    // Partial word matches
    const fileWords = fileBase.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 2);
    const beachWords = beach.name.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 2);

    fileWords.forEach(fw => {
      beachWords.forEach(bw => {
        if (fw.includes(bw) || bw.includes(fw)) {
          score += 15;
        }
      });
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = beach;
    }
  });

  // Only include high-confidence matches (score > 70)
  if (bestMatch && bestScore > 70) {
    matches.push({
      image: upload.file,
      imagePath: upload.path,
      beachId: bestMatch.id,
      beachName: bestMatch.name,
      municipality: bestMatch.municipality,
      slug: bestMatch.slug,
      currentImage: bestMatch.cover_image,
      score: Math.round(bestScore)
    });
  }
});

// Sort by score (descending)
matches.sort((a, b) => b.score - a.score);

console.log(`✅ Found ${matches.length} high-confidence matches (score > 70)\n`);
console.log('='.repeat(80));
console.log('MATCHED IMAGES TO BEACHES');
console.log('='.repeat(80));

matches.forEach((m, i) => {
  console.log(`\n${i + 1}. ${m.image}`);
  console.log(`   → Beach: ${m.beachName} (${m.municipality})`);
  console.log(`   → Slug: ${m.slug}`);
  console.log(`   → Confidence: ${m.score}%`);
  console.log(`   → Current: ${m.currentImage}`);
  console.log(`   → New: ${m.imagePath}`);
});

console.log('\n' + '='.repeat(80));

// Save mapping to JSON file
const mappingData = {
  generated: new Date().toISOString(),
  totalMatches: matches.length,
  matches: matches
};

fs.writeFileSync(
  './scripts/beach-image-mapping.json',
  JSON.stringify(mappingData, null, 2)
);

console.log(`\n💾 Mapping saved to: ./scripts/beach-image-mapping.json`);

db.close();

export { matches };
