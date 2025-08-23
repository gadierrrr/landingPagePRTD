interface RateLimit {
  count: number;
  resetAtMs: number;
}

const rateLimits = new Map<string, RateLimit>();
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
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