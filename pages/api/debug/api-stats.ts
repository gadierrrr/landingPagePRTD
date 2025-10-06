import type { NextApiRequest, NextApiResponse } from 'next';
import { apiLogger } from '../../../src/lib/apiLogger';
import { verifyAdminCookie } from '../../../src/lib/admin/auth';

/**
 * Debug endpoint to view API performance statistics
 * Only accessible to admin users
 *
 * Usage:
 * GET /api/debug/api-stats
 * GET /api/debug/api-stats?endpoint=/api/beaches/light
 * GET /api/debug/api-stats?logs=50
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require admin authentication
  const adminCookie = req.cookies.admin_auth;
  if (!verifyAdminCookie(adminCookie || '')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { endpoint, logs } = req.query;

  try {
    // If specific endpoint requested, return stats for that endpoint
    if (endpoint && typeof endpoint === 'string') {
      const stats = apiLogger.getEndpointStats(endpoint);
      const recentLogs = apiLogger.getEndpointLogs(endpoint, 50);

      return res.status(200).json({
        endpoint,
        stats,
        recentLogs
      });
    }

    // Otherwise return recent logs across all endpoints
    const limit = logs ? parseInt(logs as string, 10) : 100;
    const allLogs = apiLogger.getAllLogs(limit);

    // Group logs by endpoint for summary
    const endpointSummary: Record<string, { count: number; avgDuration: number }> = {};

    allLogs.forEach(log => {
      if (!endpointSummary[log.endpoint]) {
        endpointSummary[log.endpoint] = { count: 0, avgDuration: 0 };
      }
      endpointSummary[log.endpoint].count++;
      if (log.duration) {
        const current = endpointSummary[log.endpoint];
        current.avgDuration = (current.avgDuration * (current.count - 1) + log.duration) / current.count;
      }
    });

    return res.status(200).json({
      summary: endpointSummary,
      recentLogs: allLogs,
      totalLogs: allLogs.length
    });
  } catch (error) {
    console.error('API stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
