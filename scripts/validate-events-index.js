/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs').promises;
const path = require('path');

const EVENTS_DIR = path.join(process.cwd(), 'data', 'events');
const INDEX_FILE = path.join(EVENTS_DIR, '_index.json');

async function validateEventsIndex() {
  try {
    // Read index
    const indexData = JSON.parse(await fs.readFile(INDEX_FILE, 'utf8'));
    
    for (const week of indexData.weeks) {
      const { startDate, eventCount, cities, genres } = week;
      const weekFilePath = path.join(EVENTS_DIR, `${startDate}.json`);
      
      // Read week file
      const weekData = JSON.parse(await fs.readFile(weekFilePath, 'utf8'));
      
      // Validate event count
      if (weekData.events.length !== eventCount) {
        console.error(`❌ Week ${startDate}: expected ${eventCount} events, found ${weekData.events.length}`);
        process.exit(1);
      }
      
      // Validate cities
      const actualCities = [...new Set(weekData.events.map(e => e.city))].sort();
      const indexCities = [...cities].sort();
      if (JSON.stringify(actualCities) !== JSON.stringify(indexCities)) {
        console.error(`❌ Week ${startDate}: cities mismatch`);
        console.error(`  Expected: ${JSON.stringify(indexCities)}`);
        console.error(`  Actual: ${JSON.stringify(actualCities)}`);
        process.exit(1);
      }
      
      // Validate genres
      const actualGenres = [...new Set(weekData.events.map(e => e.genre))].sort();
      const indexGenres = [...genres].sort();
      if (JSON.stringify(actualGenres) !== JSON.stringify(indexGenres)) {
        console.error(`❌ Week ${startDate}: genres mismatch`);
        console.error(`  Expected: ${JSON.stringify(indexGenres)}`);
        console.error(`  Actual: ${JSON.stringify(actualGenres)}`);
        process.exit(1);
      }
    }
    
    console.log('✅ events index validated');
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

validateEventsIndex();