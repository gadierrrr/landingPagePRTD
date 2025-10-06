#!/usr/bin/env node
/**
 * Beach Image Updater
 * Updates beach database records with matched images
 */

import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('./data/prtd.sqlite');

// Read mapping file
const mappingData = JSON.parse(
  fs.readFileSync('./scripts/beach-image-mapping.json', 'utf8')
);

console.log('\n🔧 Beach Image Database Updater');
console.log('='.repeat(80));
console.log(`Loaded ${mappingData.totalMatches} matches from mapping file\n`);

// Filter matches
const updates = [];
const skipped = [];
const seenBeaches = new Set();

mappingData.matches.forEach(match => {
  // Skip if beach already processed (handles duplicates)
  if (seenBeaches.has(match.beachId)) {
    skipped.push({
      ...match,
      reason: 'Duplicate - already assigned first image for this beach'
    });
    return;
  }

  // Skip if beach already has a non-placeholder image
  if (!match.currentImage.includes('placeholder')) {
    skipped.push({
      ...match,
      reason: 'Beach already has actual image, keeping existing'
    });
    return;
  }

  // Skip very low confidence matches (< 90)
  if (match.score < 90) {
    skipped.push({
      ...match,
      reason: `Confidence too low (${match.score}%)`
    });
    return;
  }

  // Skip questionable matches (manual review needed)
  const questionable = [
    'copamarina-beach-resort', // Resort name, not beach
  ];

  if (questionable.some(q => match.image.includes(q))) {
    skipped.push({
      ...match,
      reason: 'Questionable match - requires manual review'
    });
    return;
  }

  // Add to updates
  updates.push(match);
  seenBeaches.add(match.beachId);
});

console.log(`✅ Updates to apply: ${updates.length}`);
console.log(`⏭️  Skipped: ${skipped.length}\n`);

if (skipped.length > 0) {
  console.log('SKIPPED MATCHES:');
  console.log('-'.repeat(80));
  skipped.forEach(s => {
    console.log(`  - ${s.image}`);
    console.log(`    Beach: ${s.beachName}`);
    console.log(`    Reason: ${s.reason}\n`);
  });
}

console.log('\nUPDATES TO APPLY:');
console.log('='.repeat(80));

updates.forEach((update, i) => {
  console.log(`\n${i + 1}. ${update.beachName} (${update.municipality})`);
  console.log(`   Slug: ${update.slug}`);
  console.log(`   Confidence: ${update.score}%`);
  console.log(`   Old: ${update.currentImage}`);
  console.log(`   New: ${update.imagePath}`);
});

console.log('\n' + '='.repeat(80));
console.log(`\n📝 Ready to update ${updates.length} beach records\n`);

// Prompt for confirmation (in script, we'll auto-confirm)
const proceedWithUpdates = true;

if (proceedWithUpdates) {
  console.log('🚀 Executing database updates...\n');

  const updateStmt = db.prepare(`
    UPDATE beaches
    SET cover_image = ?, updated_at = ?
    WHERE id = ?
  `);

  const updateMany = db.transaction((updates) => {
    updates.forEach(update => {
      const now = new Date().toISOString();
      updateStmt.run(update.imagePath, now, update.beachId);
    });
  });

  try {
    updateMany(updates);

    console.log('✅ Database updated successfully!\n');
    console.log('SUMMARY:');
    console.log(`  - Beaches updated: ${updates.length}`);
    console.log(`  - Beaches skipped: ${skipped.length}`);

    // Save update log
    const logData = {
      timestamp: new Date().toISOString(),
      updatesApplied: updates.length,
      skipped: skipped.length,
      updates: updates,
      skippedMatches: skipped
    };

    fs.writeFileSync(
      `./scripts/beach-image-update-log-${Date.now()}.json`,
      JSON.stringify(logData, null, 2)
    );

    console.log('\n💾 Update log saved to: ./scripts/beach-image-update-log-*.json');

  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }

} else {
  console.log('⏸️  Update cancelled by user');
}

db.close();

console.log('\n✨ Done!\n');
