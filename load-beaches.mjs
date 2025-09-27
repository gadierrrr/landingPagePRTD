import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = process.cwd();
const BEACHES_FILE = join(DATA_DIR, 'data/beaches.json');

try {
  const data = readFileSync(BEACHES_FILE, 'utf8');
  const beaches = JSON.parse(data);
  
  // Sort by municipality, then name
  beaches.sort((a, b) => {
    if (a.municipality !== b.municipality) {
      return a.municipality.localeCompare(b.municipality);
    }
    return a.name.localeCompare(b.name);
  });
  
  console.log(`Total beaches: ${beaches.length}`);
  console.log('\nFirst few beaches:');
  beaches.slice(0, 5).forEach((beach, i) => {
    console.log(`${i + 1}. ${beach.name} (${beach.municipality}) - slug: ${beach.slug}`);
    console.log(`   Current notes (${beach.notes?.length || 0} chars): ${beach.notes || 'None'}`);
    console.log('');
  });
} catch (error) {
  console.error('Error loading beaches:', error);
}