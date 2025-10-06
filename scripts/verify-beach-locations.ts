import { db, schema } from '../db/client';

interface Beach {
  id: string;
  name: string;
  municipality: string;
  lat: number;
  lng: number;
}

async function verifyBeachLocations() {
  console.log('Fetching beaches from database...\n');

  const beaches = await db.select({
    id: schema.beaches.id,
    name: schema.beaches.name,
    municipality: schema.beaches.municipality,
    lat: schema.beaches.lat,
    lng: schema.beaches.lng,
  }).from(schema.beaches);

  console.log(`Found ${beaches.length} beaches to verify\n`);

  // Output beaches data for MCP processing
  console.log(JSON.stringify(beaches, null, 2));
}

verifyBeachLocations().catch(console.error);
