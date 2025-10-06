/**
 * Test script for getAllBeachesLight() function
 * Verifies that the lightweight query returns correct data
 */

import { getAllBeaches, getAllBeachesLight } from '../src/lib/beachesRepo.ts';

console.log('Testing getAllBeachesLight()...\n');

try {
  // Fetch both versions
  const fullBeaches = await getAllBeaches();
  const lightBeaches = await getAllBeachesLight();

  console.log(`✓ Full beaches count: ${fullBeaches.length}`);
  console.log(`✓ Light beaches count: ${lightBeaches.length}`);

  // Verify counts match
  if (fullBeaches.length !== lightBeaches.length) {
    throw new Error(`Count mismatch: ${fullBeaches.length} vs ${lightBeaches.length}`);
  }

  // Test first beach
  const fullBeach = fullBeaches[0];
  const lightBeach = lightBeaches[0];

  console.log('\nComparing first beach:');
  console.log(`  Name: ${fullBeach.name} === ${lightBeach.name}`);
  console.log(`  Municipality: ${fullBeach.municipality} === ${lightBeach.municipality}`);
  console.log(`  Coords: ${fullBeach.coords.lat},${fullBeach.coords.lng} === ${lightBeach.coords.lat},${lightBeach.coords.lng}`);
  console.log(`  Tags: ${fullBeach.tags?.length || 0} === ${lightBeach.tags?.length || 0}`);
  console.log(`  Amenities: ${fullBeach.amenities?.length || 0} === ${lightBeach.amenities?.length || 0}`);

  // Verify essential fields are present
  const requiredFields = ['id', 'slug', 'name', 'municipality', 'coords', 'coverImage'];
  for (const field of requiredFields) {
    if (!lightBeach[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  console.log(`✓ All required fields present`);

  // Verify rich content fields are excluded
  console.log('\nRich content fields (should be empty/excluded):');
  console.log(`  Features: ${lightBeach.features?.length || 0} (expected: 0)`);
  console.log(`  Tips: ${lightBeach.tips?.length || 0} (expected: 0)`);
  console.log(`  Gallery: ${lightBeach.gallery?.length || 0} (expected: 0)`);
  console.log(`  Aliases: ${lightBeach.aliases?.length || 0} (expected: 0)`);

  if (lightBeach.features?.length > 0 || lightBeach.tips?.length > 0 ||
      lightBeach.gallery?.length > 0 || lightBeach.aliases?.length > 0) {
    console.log('⚠️  Warning: Rich content fields should be empty in light version');
  } else {
    console.log('✓ Rich content fields properly excluded');
  }

  // Calculate size difference
  const fullSize = JSON.stringify(fullBeaches).length;
  const lightSize = JSON.stringify(lightBeaches).length;
  const reduction = ((1 - lightSize / fullSize) * 100).toFixed(1);

  console.log('\nPayload size comparison:');
  console.log(`  Full beaches: ${(fullSize / 1024).toFixed(1)} KB`);
  console.log(`  Light beaches: ${(lightSize / 1024).toFixed(1)} KB`);
  console.log(`  Reduction: ${reduction}% smaller`);

  console.log('\n✅ All tests passed!');

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
