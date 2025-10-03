import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const sqliteUrl = process.env.SQLITE_PATH ?? 'file:./data/prtd.sqlite';

export default defineConfig({
  dialect: 'sqlite',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: {
    url: sqliteUrl
  },
  verbose: true,
  strict: true
});
