import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema';

const sqlitePath = process.env.SQLITE_PATH ?? path.join(process.cwd(), 'data', 'prtd.sqlite');

// Singleton database connection (shared across all imports)
const sqlite = new Database(sqlitePath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Optimize for build-time queries (read-heavy workload)
sqlite.pragma('cache_size = -64000'); // 64MB cache
sqlite.pragma('temp_store = MEMORY'); // Use memory for temp tables

export const db = drizzle(sqlite, { schema });
export { schema, sqlite };

// Graceful shutdown on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    sqlite.close();
  });
}
