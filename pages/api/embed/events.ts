import type { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIp } from '../../../src/lib/rateLimit';
import { readWeeklyEvents, getCurrentWeekStart } from '../../../src/lib/eventsStore';

// CORS headers for embed
const ALLOWED_ORIGINS = [
  'https://puertoricotraveldeals.com',
  'http://localhost:3000'
];

function setCorsHeaders(res: NextApiResponse, origin?: string) {
  if (origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  setCorsHeaders(res, req.headers.origin);
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(ip);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const { city, genre, limit = '5', week } = req.query;
    const maxLimit = Math.min(parseInt(limit as string) || 5, 10); // Cap at 10 events
    
    // Get current week or specified week
    const weekStart = (week as string) || await getCurrentWeekStart();
    const weeklyEvents = await readWeeklyEvents(weekStart);
    
    // Filter events
    let filteredEvents = weeklyEvents.events.filter(event => {
      // Hide canceled/postponed events from embeds
      if (event.status === 'canceled' || event.status === 'postponed') {
        return false;
      }
      
      // Apply filters
      if (city && event.city !== city) return false;
      if (genre && event.genre !== genre) return false;
      
      return true;
    });

    // Sort by start time (earliest first)
    filteredEvents.sort((a, b) => 
      new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );

    // Limit results
    filteredEvents = filteredEvents.slice(0, maxLimit);

    // Transform for embed (minimal data)
    const embedEvents = filteredEvents.map(event => ({
      id: event.id,
      title: event.title,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      city: event.city,
      venueName: event.venueName,
      genre: event.genre,
      free: event.free,
      priceFrom: event.priceFrom,
      heroImage: event.heroImage,
      links: event.links,
      sponsorPlacement: event.sponsorPlacement
    }));

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=900, stale-while-revalidate=300'); // 15 min cache
    
    return res.status(200).json({
      events: embedEvents,
      weekStart,
      totalEvents: weeklyEvents.events.length,
      filteredCount: embedEvents.length
    });
  } catch (error) {
    console.error('Embed events API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}