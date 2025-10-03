/**
 * Data source configuration and factory for switching between SQLite and JSON file storage
 */

export type DataSource = 'sqlite' | 'json';

export function getDataSource(): DataSource {
  const source = process.env.DATA_SOURCE?.toLowerCase();
  if (source === 'sqlite') {
    return 'sqlite';
  }
  return 'json'; // Default to JSON for backward compatibility
}

export function isSqliteEnabled(): boolean {
  return getDataSource() === 'sqlite';
}
