import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllPostsMeta } from '../../src/lib/blog';
import { checkRateLimit, getClientIp } from '../../src/lib/rateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = getClientIp(req);
  const rateCheck = await checkRateLimit(ip);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const posts = await getAllPostsMeta();
        
        // Set cache headers similar to deals API
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        return res.status(200).json(posts);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Blog API error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Internal server error' });
  }
}