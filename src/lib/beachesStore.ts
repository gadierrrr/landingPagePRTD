import { promises as fs } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { Beach } from './forms';
import { generateBeachSlug } from './slugGenerator';

const USE_SQLITE = (process.env.PRTD_DATA_BACKEND || '').toLowerCase() === 'sqlite';

async function loadBeachesRepo() {
  // Lazy require to avoid bundling when JSON backend is used.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('./beachesRepo');
}

// Use production data paths, fallback to development
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/var/prtd-data' : join(process.cwd(), 'data');
const BEACHES_FILE = join(DATA_DIR, 'beaches.json');
const BEACHES_FILE_TMP = join(DATA_DIR, 'beaches.json.tmp');
const BEACHES_FILE_LOCK = join(DATA_DIR, 'beaches.json.lock');
const BEACHES_AUDIT_LOG = join(DATA_DIR, 'beaches.log.jsonl');

// File lock timeout in milliseconds
const LOCK_TIMEOUT = 5000;

interface AuditLogEntry {
  timestamp: string;
  admin_user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  beach_id: string;
  before_hash?: string;
  after_hash?: string;
  duplicate_decision?: 'save_anyway' | 'merge';
  ip_address?: string;
}

interface DuplicateCandidate {
  beach: Beach;
  distance: number; // meters
  nameSimilarity: number; // 0-1
  reason: string;
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
           Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate string similarity using simple Levenshtein distance
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Generate hash for beach data (for audit logging)
function generateDataHash(beach: Partial<Beach>): string {
  const dataForHash = { ...beach };
  delete dataForHash.updatedAt; // Exclude timestamp from hash
  return crypto.createHash('md5').update(JSON.stringify(dataForHash)).digest('hex');
}

// File locking utilities
async function acquireLock(): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < LOCK_TIMEOUT) {
    try {
      await fs.writeFile(BEACHES_FILE_LOCK, process.pid.toString(), { flag: 'wx' });
      return; // Lock acquired
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
      // Lock file exists, wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  throw new Error('Failed to acquire file lock within timeout');
}

async function releaseLock(): Promise<void> {
  try {
    await fs.unlink(BEACHES_FILE_LOCK);
  } catch (error) {
    // Ignore if lock file doesn't exist
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn('Failed to release lock file:', error);
    }
  }
}

// Audit logging
async function appendAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const logLine = JSON.stringify(entry) + '\n';
    await fs.appendFile(BEACHES_AUDIT_LOG, logLine, 'utf8');
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Don't throw - audit logging shouldn't break the operation
  }
}

// Core store operations
export async function readBeaches(): Promise<Beach[]> {
  if (USE_SQLITE) {
    const { getAllBeaches } = await loadBeachesRepo();
    return getAllBeaches();
  }
  try {
    const data = await fs.readFile(BEACHES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Create data directory if it doesn't exist
      await fs.mkdir(DATA_DIR, { recursive: true });
      return [];
    }
    throw error;
  }
}

export async function writeBeaches(beaches: Beach[]): Promise<void> {
  await acquireLock();
  
  try {
    const data = JSON.stringify(beaches, null, 2);
    
    // Atomic write: write to temp file, then rename
    await fs.writeFile(BEACHES_FILE_TMP, data, 'utf8');
    await fs.rename(BEACHES_FILE_TMP, BEACHES_FILE);
    
    // Set appropriate permissions (readable by web server)
    await fs.chmod(BEACHES_FILE, 0o600);
  } finally {
    await releaseLock();
  }
}

export async function findDuplicateCandidates(
  beach: Omit<Beach, 'id' | 'slug'>,
  excludeId?: string
): Promise<DuplicateCandidate[]> {
  const beaches = await readBeaches();
  const candidates: DuplicateCandidate[] = [];
  
  for (const existingBeach of beaches) {
    if (excludeId && existingBeach.id === excludeId) {
      continue; // Skip the beach being updated
    }
    
    // Check if in same municipality
    if (existingBeach.municipality !== beach.municipality) {
      continue;
    }
    
    // Calculate distance
    const distance = calculateDistance(
      beach.coords.lat, beach.coords.lng,
      existingBeach.coords.lat, existingBeach.coords.lng
    );
    
    // Calculate name similarity
    const nameSimilarity = calculateStringSimilarity(beach.name, existingBeach.name);
    
    // Check aliases too
    let maxSimilarity = nameSimilarity;
    if (beach.aliases) {
      for (const alias of beach.aliases) {
        const aliasSimilarity = calculateStringSimilarity(alias, existingBeach.name);
        if (aliasSimilarity > maxSimilarity) {
          maxSimilarity = aliasSimilarity;
        }
      }
    }
    if (existingBeach.aliases) {
      for (const existingAlias of existingBeach.aliases) {
        const aliasSimilarity = calculateStringSimilarity(beach.name, existingAlias);
        if (aliasSimilarity > maxSimilarity) {
          maxSimilarity = aliasSimilarity;
        }
      }
    }
    
    // Flag as potential duplicate if close proximity + high name similarity
    if (distance < 250 && maxSimilarity >= 0.85) {
      let reason = `${Math.round(distance)}m away`;
      if (maxSimilarity >= 0.95) {
        reason += ', very similar name';
      } else if (maxSimilarity >= 0.9) {
        reason += ', similar name';
      }
      
      candidates.push({
        beach: existingBeach,
        distance,
        nameSimilarity: maxSimilarity,
        reason
      });
    }
  }
  
  // Sort by distance, then by name similarity
  candidates.sort((a, b) => {
    if (Math.abs(a.distance - b.distance) < 50) {
      return b.nameSimilarity - a.nameSimilarity;
    }
    return a.distance - b.distance;
  });
  
  return candidates;
}

export async function addBeach(
  beach: Omit<Beach, 'id' | 'slug'>,
  options: { duplicateDecision?: 'save_anyway' | 'merge'; adminUser?: string; ipAddress?: string } = {}
): Promise<Beach> {
  const beaches = await readBeaches();
  const existingSlugs = beaches.map(b => b.slug).filter(Boolean) as string[];
  
  const newBeach: Beach = {
    ...beach,
    id: crypto.randomUUID(),
    slug: generateBeachSlug(beach.name, beach.municipality, beach.coords, existingSlugs),
    updatedAt: new Date().toISOString(),
    // Ensure arrays have defaults
    tags: beach.tags || [],
    amenities: beach.amenities || [],
    gallery: beach.gallery || []
  };
  
  beaches.push(newBeach);
  await writeBeaches(beaches);
  
  // Audit log
  await appendAuditLog({
    timestamp: new Date().toISOString(),
    admin_user: options.adminUser || 'unknown',
    action: 'CREATE',
    beach_id: newBeach.id!,
    after_hash: generateDataHash(newBeach),
    duplicate_decision: options.duplicateDecision,
    ip_address: options.ipAddress
  });
  
  return newBeach;
}

export async function updateBeach(
  id: string,
  updates: Partial<Omit<Beach, 'id' | 'slug'>>,
  options: { duplicateDecision?: 'save_anyway' | 'merge'; adminUser?: string; ipAddress?: string } = {}
): Promise<Beach | null> {
  const beaches = await readBeaches();
  const index = beaches.findIndex(beach => beach.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const beforeHash = generateDataHash(beaches[index]);
  
  // Preserve the slug - it should never change once set
  const { slug, ...safeUpdates } = updates as Partial<Beach>;
  // Intentionally ignore slug changes
  void slug;
  
  // Always update the updatedAt timestamp on edits
  beaches[index] = { 
    ...beaches[index], 
    ...safeUpdates, 
    updatedAt: new Date().toISOString() 
  };
  
  await writeBeaches(beaches);
  
  // Audit log
  await appendAuditLog({
    timestamp: new Date().toISOString(),
    admin_user: options.adminUser || 'unknown',
    action: 'UPDATE',
    beach_id: id,
    before_hash: beforeHash,
    after_hash: generateDataHash(beaches[index]),
    duplicate_decision: options.duplicateDecision,
    ip_address: options.ipAddress
  });
  
  return beaches[index];
}

export async function deleteBeach(
  id: string,
  options: { adminUser?: string; ipAddress?: string } = {}
): Promise<boolean> {
  const beaches = await readBeaches();
  const index = beaches.findIndex(beach => beach.id === id);
  
  if (index === -1) {
    return false;
  }
  
  const beforeHash = generateDataHash(beaches[index]);
  
  beaches.splice(index, 1);
  await writeBeaches(beaches);
  
  // Audit log
  await appendAuditLog({
    timestamp: new Date().toISOString(),
    admin_user: options.adminUser || 'unknown',
    action: 'DELETE',
    beach_id: id,
    before_hash: beforeHash,
    ip_address: options.ipAddress
  });
  
  return true;
}

export async function getBeachBySlug(slug: string): Promise<Beach | null> {
  if (USE_SQLITE) {
    const { getBeachBySlug } = await loadBeachesRepo();
    return getBeachBySlug(slug);
  }

  const beaches = await readBeaches();
  return beaches.find(beach => beach.slug === slug) || null;
}

export async function getBeachById(id: string): Promise<Beach | null> {
  if (USE_SQLITE) {
    const { getAllBeaches } = await loadBeachesRepo();
    const beaches = await getAllBeaches();
    return beaches.find(beach => beach.id === id) || null;
  }

  const beaches = await readBeaches();
  return beaches.find(beach => beach.id === id) || null;
}

// Health check utility
export async function getBeachesHealth(): Promise<{
  count: number;
  fileSizeKB: number;
  lastWriteTs?: string;
}> {
  try {
    const beaches = await readBeaches();
    const stats = await fs.stat(BEACHES_FILE);
    
    return {
      count: beaches.length,
      fileSizeKB: Math.round(stats.size / 1024),
      lastWriteTs: stats.mtime.toISOString()
    };
  } catch (error) {
    return {
      count: 0,
      fileSizeKB: 0
    };
  }
}
