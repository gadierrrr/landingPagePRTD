import { NextApiRequest, NextApiResponse } from 'next';

interface ClickTrackingRequest {
  dealId: string;
  dealSlug: string;
  externalUrl: string;
  userId?: string;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
}

/**
 * Server-side click tracking endpoint
 * This ensures we capture the click even if client-side tracking fails
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      dealId,
      dealSlug,
      externalUrl,
      userId,
      sessionId,
      referrer,
      userAgent
    }: ClickTrackingRequest = req.body;

    // Get client IP for geographic insights
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress;

    // Log the click (you can enhance this to store in database)
    const clickData = {
      dealId,
      dealSlug,
      externalUrl,
      timestamp: new Date().toISOString(),
      clientIp,
      userId,
      sessionId,
      referrer: referrer || req.headers.referer,
      userAgent: userAgent || req.headers['user-agent'],
    };

    // For now, log to console (you can replace with database storage)
    console.log('Deal click tracked:', clickData);

    // You could store this in a database here:
    // await db.dealClicks.create({ data: clickData });

    // Return success with redirect URL
    res.status(200).json({ 
      success: true, 
      redirectUrl: externalUrl,
      trackingId: `click_${Date.now()}_${dealId}`
    });

  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
}