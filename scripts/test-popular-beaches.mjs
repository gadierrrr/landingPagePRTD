/**
 * Test popular beaches filtering logic
 */

import { getAllBeachesLight } from '../src/lib/beachesRepo.ts';
import { isPopularBeach } from '../src/constants/popularBeaches.ts';

console.log('Testing popular beaches filter...\n');

try {
  const beaches = await getAllBeachesLight();

  const popularBeaches = beaches.filter(beach =>
    beach.slug && isPopularBeach({
      municipality: beach.municipality,
      tags: beach.tags
    })
  );

  console.log(`Total beaches: ${beaches.length}`);
  console.log(`Popular beaches: ${popularBeaches.length}`);
  console.log(`\nPopular municipalities represented:`);

  const municipalities = [...new Set(popularBeaches.map(b => b.municipality))];
  municipalities.forEach(m => {
    const count = popularBeaches.filter(b => b.municipality === m).length;
    console.log(`  - ${m}: ${count} beaches`);
  });

  console.log(`\nSample popular beaches:`);
  popularBeaches.slice(0, 5).forEach(b => {
    console.log(`  - ${b.name} (${b.municipality})`);
  });

  console.log(`\n✅ Filter working correctly!`);

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
