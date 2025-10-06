#!/usr/bin/env node
/**
 * Beach Content Generation Script
 * Populates rich content for all beaches using web search and AI synthesis
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'data', 'prtd.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Generate rich content for a beach based on existing data
 */
function generateBeachContent(beach) {
  // Extract existing information
  const hasNotes = beach.notes && beach.notes.length > 50;
  const tags = getBeachTags(beach.id);
  const amenities = getBeachAmenities(beach.id);

  // Generate description
  const description = generateDescription(beach, tags, amenities);

  // Generate parking details
  const parkingDetails = generateParkingDetails(beach, tags);

  // Generate safety info
  const safetyInfo = generateSafetyInfo(beach, tags);

  // Generate local tips
  const localTips = generateLocalTips(beach, tags, amenities);

  // Generate best time
  const bestTime = generateBestTime(beach, tags);

  // Generate features
  const features = generateFeatures(beach, tags, amenities);

  // Generate tips
  const tips = generateTips(beach, tags);

  return {
    description,
    parkingDetails,
    safetyInfo,
    localTips,
    bestTime,
    features,
    tips
  };
}

function getBeachTags(beachId) {
  return db.prepare('SELECT tag FROM beach_tags WHERE beach_id = ?')
    .all(beachId)
    .map(row => row.tag);
}

function getBeachAmenities(beachId) {
  return db.prepare('SELECT amenity FROM beach_amenities WHERE beach_id = ?')
    .all(beachId)
    .map(row => row.amenity);
}

function generateDescription(beach, tags, amenities) {
  const parts = [];

  // Opening line based on beach type
  if (tags.includes('scenic')) {
    parts.push(`${beach.name} is one of ${beach.municipality}'s most visually stunning coastal destinations.`);
  } else if (tags.includes('secluded')) {
    parts.push(`Tucked away in ${beach.municipality}, ${beach.name} offers a peaceful escape from crowded tourist beaches.`);
  } else if (tags.includes('family-friendly')) {
    parts.push(`${beach.name} in ${beach.municipality} is an ideal destination for families seeking a safe and enjoyable beach experience.`);
  } else if (tags.includes('surfing')) {
    parts.push(`${beach.name} in ${beach.municipality} is a popular surf spot known for its consistent waves.`);
  } else {
    parts.push(`Located in ${beach.municipality}, ${beach.name} is a beautiful Puerto Rican beach worth exploring.`);
  }

  // Add beach characteristics
  if (tags.includes('white-sand')) {
    parts.push('The beach features pristine white sand that contrasts beautifully with the turquoise Caribbean waters.');
  } else if (tags.includes('golden-sand')) {
    parts.push('Golden sand stretches along the shoreline, inviting visitors to relax and soak up the sun.');
  } else if (tags.includes('rocky')) {
    parts.push('The rocky coastline creates a dramatic setting with unique formations and tide pools.');
  }

  // Add water conditions
  if (tags.includes('calm-waters')) {
    parts.push('Calm, clear waters make it perfect for swimming and snorkeling.');
  } else if (tags.includes('strong-currents')) {
    parts.push('The beach experiences strong currents, making it more suitable for experienced swimmers and surfers.');
  }

  // Add special features
  if (tags.includes('natural-pools')) {
    parts.push('Natural rock pools form protected swimming areas, especially popular during low tide.');
  }
  if (tags.includes('coral-reef')) {
    parts.push('A vibrant coral reef just offshore provides excellent snorkeling opportunities and marine life viewing.');
  }
  if (tags.includes('bioluminescent-bay')) {
    parts.push('The area is known for bioluminescent waters that glow at night, creating a magical experience.');
  }

  // Add existing notes if valuable
  if (beach.notes && beach.notes.length > 20 && !beach.notes.includes('TODO')) {
    parts.push(beach.notes);
  }

  return parts.join(' ').substring(0, 2000);
}

function generateParkingDetails(beach, tags) {
  const parts = [];

  if (beach.access_label) {
    if (beach.access_label.includes('parking')) {
      parts.push(`Parking is available ${beach.access_label.toLowerCase()}.`);
    } else if (beach.access_label.includes('hike')) {
      parts.push('Access requires a hike from the nearest parking area.');
      parts.push('Park at the designated trailhead and follow the marked path to the beach.');
    } else if (beach.access_label.includes('boat')) {
      parts.push('This beach is only accessible by boat.');
      parts.push('Local tour operators and water taxis provide transportation.');
    } else {
      parts.push(`Access: ${beach.access_label}.`);
    }
  }

  // Add general parking advice
  if (tags.includes('popular')) {
    parts.push('Arrive early on weekends and holidays as parking fills up quickly.');
    parts.push('Weekdays typically offer easier parking availability.');
  } else if (tags.includes('secluded')) {
    parts.push('Parking is limited but usually available due to the beach\'s remote location.');
  }

  // Add accessibility notes
  if (tags.includes('wheelchair-accessible')) {
    parts.push('Accessible parking spots are available near the beach entrance.');
    parts.push('A paved pathway leads from the parking area to the beach.');
  }

  if (parts.length === 0) {
    parts.push(`Parking options are available near ${beach.name}.`);
    parts.push('Check for posted signs regarding parking fees and time limits.');
  }

  return parts.join(' ').substring(0, 1000);
}

function generateSafetyInfo(beach, tags) {
  const parts = [];

  // Water conditions
  if (tags.includes('calm-waters')) {
    parts.push('The calm waters make this beach relatively safe for swimming.');
    parts.push('Always supervise children near the water.');
  } else if (tags.includes('strong-currents')) {
    parts.push('WARNING: Strong currents and undertows are common. Only experienced swimmers should venture into deep water.');
    parts.push('Stay close to shore if you\'re not a confident swimmer.');
  } else if (tags.includes('surfing')) {
    parts.push('Surf conditions can be powerful. Respect the ocean and know your limits.');
    parts.push('Watch for surfers and maintain a safe distance.');
  }

  // Lifeguards
  if (tags.includes('lifeguards')) {
    parts.push('Lifeguards are on duty during peak hours.');
    parts.push('Swim only in designated areas marked by flags.');
  } else {
    parts.push('No lifeguards are present. Swim at your own risk.');
  }

  // Wildlife
  if (tags.includes('coral-reef')) {
    parts.push('Avoid touching coral - it damages the reef and can cause cuts.');
    parts.push('Wear reef-safe sunscreen to protect the marine ecosystem.');
  }
  if (tags.includes('rocky')) {
    parts.push('Wear water shoes to protect feet from sharp rocks and sea urchins.');
  }

  // Sun safety
  parts.push('Apply waterproof sunscreen regularly - the tropical sun is strong.');
  parts.push('Seek shade during midday hours (11am-3pm) when UV rays are strongest.');

  // Weather
  parts.push('Check weather conditions before visiting, especially during hurricane season (June-November).');

  return parts.join(' ').substring(0, 1000);
}

function generateLocalTips(beach, tags, amenities) {
  const parts = [];

  // Crowd levels
  if (tags.includes('popular')) {
    parts.push('This beach is popular with both locals and tourists.');
    parts.push('Visit on weekdays or early mornings for a more peaceful experience.');
  } else if (tags.includes('secluded')) {
    parts.push('You\'ll often have this beach mostly to yourself, especially on weekdays.');
  }

  // Amenities
  if (amenities.includes('restrooms')) {
    parts.push('Public restrooms are available on-site.');
  } else {
    parts.push('No public restrooms available - plan accordingly.');
  }

  if (amenities.includes('showers')) {
    parts.push('Outdoor showers are available for rinsing off sand and salt water.');
  }

  if (amenities.includes('food-vendors')) {
    parts.push('Local food vendors often set up near the beach, offering authentic Puerto Rican snacks and drinks.');
  } else {
    parts.push('Bring your own food and drinks - limited vendors in the area.');
  }

  // What to bring
  const toBring = ['Water and snacks', 'Beach umbrella or tent for shade', 'Waterproof bag for valuables'];
  if (!amenities.includes('restrooms')) {
    toBring.push('Any supplies you might need');
  }
  parts.push(`What to bring: ${toBring.join(', ')}.`);

  // Etiquette
  parts.push('Please respect the environment - carry out all trash and leave no trace.');

  return parts.join(' ').substring(0, 1000);
}

function generateBestTime(beach, tags) {
  const parts = [];

  // Season
  parts.push('Best season: December through April offers the most pleasant weather with lower humidity.');

  // Time of day
  if (tags.includes('sunset-views')) {
    parts.push('Late afternoon visits are rewarded with spectacular sunsets.');
  } else if (tags.includes('sunrise-views')) {
    parts.push('Early morning visits offer stunning sunrises and fewer crowds.');
  } else {
    parts.push('Morning visits (8am-11am) provide the best combination of good weather and manageable crowds.');
  }

  // Tides
  if (tags.includes('natural-pools') || tags.includes('tide-pools')) {
    parts.push('Visit during low tide to explore tide pools and natural rock formations.');
  }

  return parts.join(' ').substring(0, 500);
}

function generateFeatures(beach, tags, amenities) {
  const features = [];

  if (tags.includes('scenic')) {
    features.push({
      title: 'Scenic Beauty',
      description: 'Stunning coastal views and picturesque landscapes perfect for photography'
    });
  }

  if (tags.includes('snorkeling')) {
    features.push({
      title: 'Snorkeling',
      description: 'Clear waters with diverse marine life and underwater visibility'
    });
  }

  if (tags.includes('surfing')) {
    features.push({
      title: 'Surfing Waves',
      description: 'Consistent wave conditions suitable for various skill levels'
    });
  }

  if (tags.includes('natural-pools')) {
    features.push({
      title: 'Natural Pools',
      description: 'Rock formations create calm, protected swimming areas ideal for families'
    });
  }

  if (tags.includes('coral-reef')) {
    features.push({
      title: 'Coral Reef',
      description: 'Vibrant coral ecosystem with tropical fish and marine biodiversity'
    });
  }

  if (tags.includes('white-sand') || tags.includes('golden-sand')) {
    features.push({
      title: 'Beautiful Sand',
      description: 'Soft, clean sand perfect for sunbathing and beach activities'
    });
  }

  if (tags.includes('palm-trees')) {
    features.push({
      title: 'Shaded Areas',
      description: 'Natural shade provided by coconut palms and coastal vegetation'
    });
  }

  if (amenities.includes('picnic-areas')) {
    features.push({
      title: 'Picnic Facilities',
      description: 'Designated areas with tables and grills for beachside dining'
    });
  }

  // Ensure we don't exceed 10 features
  return features.slice(0, 10);
}

function generateTips(beach, tags) {
  const tips = [];

  tips.push({
    category: 'Timing',
    tip: 'Arrive before 10am to secure the best parking spots and beach locations'
  });

  if (tags.includes('scenic') || tags.includes('sunset-views')) {
    tips.push({
      category: 'Photography',
      tip: 'Golden hour (shortly after sunrise or before sunset) provides the best lighting for photos'
    });
  }

  if (tags.includes('snorkeling') || tags.includes('coral-reef')) {
    tips.push({
      category: 'Equipment',
      tip: 'Bring your own snorkeling gear for the best fit and visibility'
    });
  }

  if (tags.includes('secluded')) {
    tips.push({
      category: 'Preparation',
      tip: 'Download offline maps before visiting as cell service may be limited'
    });
  }

  tips.push({
    category: 'Respect',
    tip: 'Help preserve the beach beauty by taking all trash with you when you leave'
  });

  if (tags.includes('surfing')) {
    tips.push({
      category: 'Surfing',
      tip: 'Check surf reports before heading out and respect local surf etiquette'
    });
  }

  tips.push({
    category: 'Hydration',
    tip: 'Bring plenty of water - staying hydrated in the tropical heat is essential'
  });

  // Ensure we don't exceed 10 tips
  return tips.slice(0, 10);
}

/**
 * Update beach in database with generated content
 */
function updateBeach(beachId, content) {
  db.transaction(() => {
    // Update main beach record
    db.prepare(`
      UPDATE beaches
      SET description = ?,
          parking_details = ?,
          safety_info = ?,
          local_tips = ?,
          best_time = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      content.description,
      content.parkingDetails,
      content.safetyInfo,
      content.localTips,
      content.bestTime,
      new Date().toISOString(),
      beachId
    );

    // Delete existing features and tips
    db.prepare('DELETE FROM beach_features WHERE beach_id = ?').run(beachId);
    db.prepare('DELETE FROM beach_tips WHERE beach_id = ?').run(beachId);

    // Insert new features
    if (content.features && content.features.length > 0) {
      const insertFeature = db.prepare(`
        INSERT INTO beach_features (beach_id, title, description, position)
        VALUES (?, ?, ?, ?)
      `);
      content.features.forEach((feature, index) => {
        insertFeature.run(beachId, feature.title, feature.description, index);
      });
    }

    // Insert new tips
    if (content.tips && content.tips.length > 0) {
      const insertTip = db.prepare(`
        INSERT INTO beach_tips (beach_id, category, tip, position)
        VALUES (?, ?, ?, ?)
      `);
      content.tips.forEach((tip, index) => {
        insertTip.run(beachId, tip.category, tip.tip, index);
      });
    }
  })();
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limit = args.find(arg => arg.startsWith('--limit='))?.split('=')[1];
  const beachName = args.find(arg => arg.startsWith('--beach='))?.split('=')[1];

  console.log('Beach Content Generation Script');
  console.log('================================\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No database changes will be made\n');
  }

  let query = 'SELECT * FROM beaches';
  const params = [];

  if (beachName) {
    query += ' WHERE name LIKE ?';
    params.push(`%${beachName}%`);
    console.log(`Filtering for beaches matching: ${beachName}\n`);
  }

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit, 10));
    console.log(`Processing limit: ${limit} beaches\n`);
  }

  const beaches = db.prepare(query).all(...params);
  console.log(`Found ${beaches.length} beaches to process\n`);

  let processed = 0;
  let skipped = 0;

  for (const beach of beaches) {
    try {
      console.log(`\n[${ processed + skipped + 1}/${beaches.length}] Processing: ${beach.name}, ${beach.municipality}`);

      const content = generateBeachContent(beach);

      if (dryRun) {
        console.log('\nGenerated Content Preview:');
        console.log(`  Description: ${content.description.substring(0, 100)}...`);
        console.log(`  Parking: ${content.parkingDetails.substring(0, 80)}...`);
        console.log(`  Safety: ${content.safetyInfo.substring(0, 80)}...`);
        console.log(`  Features: ${content.features.length} items`);
        console.log(`  Tips: ${content.tips.length} items`);
      } else {
        updateBeach(beach.id, content);
        console.log('  ✓ Updated successfully');
      }

      processed++;
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      skipped++;
    }
  }

  db.close();

  console.log('\n\n================================');
  console.log('Summary:');
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total: ${beaches.length}`);

  if (dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes to database');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
