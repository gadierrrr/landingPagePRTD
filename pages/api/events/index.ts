import type { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '../../../src/lib/rateLimit';
import { readEventsIndex } from '../../../src/lib/eventsStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(ip);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const index = await readEventsIndex();
        return res.status(200).json(index);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Events index API error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Internal server error' });
  }
}