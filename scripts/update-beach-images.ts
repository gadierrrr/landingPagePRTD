#!/usr/bin/env npx tsx

import { readBeaches, writeBeaches } from '../src/lib/beachesStore';
import { Beach } from '../src/lib/forms';

// Mapping of beach names to their new image paths
const BEACH_IMAGE_UPDATES: Record<string, string> = {
  'Survival / Playuela': '/images/beaches/survival-playuela-aguadilla.jpeg',
  'Wilderness': '/images/beaches/wilderness-aguadilla.jpeg', 
  'Gas Chambers': '/images/beaches/gas-chambers-aguadilla.jpeg',
  'Crash Boat South (Almirante Beach)': '/images/beaches/crash-boat-south-almirante-beach-aguadilla.jpeg',
  'Jobos Beach': '/images/beaches/jobos-beach-isabela.jpeg',
  'Montones Beach': '/images/beaches/montones-beach-isabela.jpeg',
  'Villa Pesquera (Isabela)': '/images/beaches/villa-pesquera-isabela-isabela.jpeg',
  'Cueva de las Golondrinas Cove': '/images/beaches/cueva-de-las-golondrinas-cove-isabela.jpeg',
  'Aguada Malecón Strip': '/images/beaches/aguada-malecn-strip-aguada.jpeg',
  'Buyé Beach': '/images/beaches/buy-beach-cabo rojo.jpeg',
  'Combate Beach': '/images/beaches/combate-beach-cabo rojo.jpeg',
  'La Playuela (Playa Sucia)': '/images/beaches/la-playuela-playa-sucia-cabo rojo.jpeg',
  'Blue Hole Reef Access': '/images/beaches/blue-hole-reef-access-isabela.jpeg',
  'Flamenco Beach': '/images/beaches/flamenco-beach-culebra.jpeg'
};

async function updateBeachImages() {
  console.log('🔄 Updating beach data with new image paths...\n');
  
  // Read current beach data
  const beaches = await readBeaches();
  console.log(`📊 Loaded ${beaches.length} beaches from database`);
  
  let updatedCount = 0;
  const updatedBeaches: Beach[] = [];
  
  for (const beach of beaches) {
    const newImagePath = BEACH_IMAGE_UPDATES[beach.name];
    
    if (newImagePath) {
      console.log(`✅ Updating ${beach.name}:`);
      console.log(`   Old: ${beach.coverImage}`);
      console.log(`   New: ${newImagePath}`);
      
      updatedBeaches.push({
        ...beach,
        coverImage: newImagePath,
        updatedAt: new Date().toISOString()
      });
      
      updatedCount++;
    } else {
      updatedBeaches.push(beach);
    }
  }
  
  if (updatedCount > 0) {
    console.log(`\n💾 Saving ${updatedCount} updated beaches...`);
    await writeBeaches(updatedBeaches);
    console.log('✅ Beach data updated successfully!');
  } else {
    console.log('ℹ️  No beaches to update');
  }
  
  console.log('\n📋 SUMMARY:');
  console.log(`Updated beaches: ${updatedCount}`);
  console.log(`Total beaches: ${beaches.length}`);
  console.log(`Success rate: ${((updatedCount / Object.keys(BEACH_IMAGE_UPDATES).length) * 100).toFixed(1)}%`);
}

// Run the script
if (import.meta.url.endsWith(process.argv[1])) {
  updateBeachImages().catch(console.error);
}

export { updateBeachImages };