import type { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '../../src/lib/rateLimit';
import { getAllBeachesLight } from '../../src/lib/beachesRepo';
import { apiLogger } from '../../src/lib/apiLogger';

/**
 * Lightweight beaches API endpoint
 * Returns beaches without rich content (features, tips, gallery, aliases)
 * Used for beach finder list/map views where full content is not needed
 *
 * Public endpoint with rate limiting and caching
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  const rateCheck = await checkRateLimit(ip);

  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const startTime = Date.now();

  try {
    apiLogger.logRequest('/api/beaches/light', 'GET', ip, req.headers['user-agent']);

    const beaches = await getAllBeachesLight();

    const duration = Date.now() - startTime;
    apiLogger.logResponse('/api/beaches/light', 'GET', 200, duration);

    // Set caching headers
    // - Browser cache: 5 minutes (max-age=300)
    // - CDN/proxy cache: 1 hour (s-maxage=3600)
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).json(beaches);

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    apiLogger.logResponse('/api/beaches/light', 'GET', 500, duration, errorMessage);

    console.error('Beaches light API error:', errorMessage);

    return res.status(500).json({
      error: 'Internal server error',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }
}
