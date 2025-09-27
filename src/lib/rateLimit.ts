import { createClient } from 'redis';

interface RateLimit {
  count: number;
  resetAtMs: number;
}

// Fallback in-memory rate limiting for Redis unavailability
const rateLimits = new Map<string, RateLimit>();
const RATE_LIMIT_REQUESTS = 50; // Increased for admin operations
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Redis client with connection handling
let redisClient: ReturnType<typeof createClient> | null = null;
let isRedisConnected = false;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      socket: {
        host: 'localhost',
        port: 6379,
        connectTimeout: 1000
      }
    });

    redisClient.on('error', (err) => {
      console.warn('Redis rate limit error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
    });

    redisClient.on('end', () => {
      isRedisConnected = false;
    });
  }

  if (!isRedisConnected) {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      isRedisConnected = true;
    } catch (error) {
      console.warn('Redis connection failed, falling back to in-memory rate limiting:', error);
      isRedisConnected = false;
    }
  }

  return isRedisConnected ? redisClient : null;
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const redis = await getRedisClient();
  
  if (redis) {
    return checkRateLimitRedis(ip, redis);
  } else {
    return checkRateLimitMemory(ip);
  }
}

async function checkRateLimitRedis(ip: string, redis: ReturnType<typeof createClient>): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  try {
    // Use sliding window log approach with Redis sorted sets
    const pipe = redis.multi();
    
    // Remove expired entries
    pipe.zRemRangeByScore(key, 0, windowStart);
    
    // Count current requests in window
    pipe.zCard(key);
    
    // Add current request
    pipe.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
    
    // Set expiration
    pipe.expire(key, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000));
    
    const results = await pipe.exec();
    const currentCount = Number(results[1]) || 0;
    
    if (currentCount >= RATE_LIMIT_REQUESTS) {
      // Remove the request we just added since it's over limit
      await redis.zRem(key, `${now}-${Math.random()}`);
      return { allowed: false, remaining: 0 };
    }
    
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - (currentCount + 1) };
  } catch (error) {
    console.warn('Redis rate limit operation failed, falling back to memory:', error);
    isRedisConnected = false;
    return checkRateLimitMemory(ip);
  }
}

function checkRateLimitMemory(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = rateLimits.get(ip);
  
  if (!existing || now >= existing.resetAtMs) {
    // First request or window expired
    rateLimits.set(ip, {
      count: 1,
      resetAtMs: now + RATE_LIMIT_WINDOW_MS
    });
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
  }
  
  if (existing.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  existing.count++;
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - existing.count };
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
  }
  return req.socket?.remoteAddress || 'unknown';
}