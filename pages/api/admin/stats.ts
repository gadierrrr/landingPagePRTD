import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminCookie } from '../../../src/lib/admin/auth';
import { getAllBeaches } from '../../../src/lib/beachesRepo';
import { getAllDeals } from '../../../src/lib/dealsRepo';
import { getEventsIndex } from '../../../src/lib/eventsRepo';
import { getAllGuidesMeta } from '../../../src/lib/guides';
import { isSqliteEnabled } from '../../../src/lib/dataSource';
import { readBeaches } from '../../../src/lib/beachesStore';
import { readDeals } from '../../../src/lib/dealsStore';
import { readEventsIndex } from '../../../src/lib/eventsStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify admin authentication
  const adminCookie = req.cookies.admin_auth;
  if (!verifyAdminCookie(adminCookie || '')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch all data counts
    const [beaches, deals, eventsIndex, posts] = await Promise.all([
      isSqliteEnabled() ? getAllBeaches() : readBeaches(),
      isSqliteEnabled() ? getAllDeals() : readDeals(),
      isSqliteEnabled() ? getEventsIndex() : readEventsIndex(),
      getAllGuidesMeta()
    ]);

    // Calculate total events across all weeks
    const totalEvents = eventsIndex.weeks.reduce((sum, week) => sum + week.eventCount, 0);

    const stats = {
      beaches: beaches.length,
      deals: deals.length,
      events: totalEvents,
      posts: posts.length
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
