import { migrateDealsForSlugs } from '../src/lib/dealsStore';

async function runMigration() {
  try {
    console.log('Starting deals migration...');
    await migrateDealsForSlugs();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();