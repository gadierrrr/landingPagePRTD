import type { NextApiRequest, NextApiResponse } from 'next';
import { beachSchema } from '../../../src/lib/forms';
import { checkRateLimit, getClientIp } from '../../../src/lib/rateLimit';
import { readBeaches, addBeach, findDuplicateCandidates } from '../../../src/lib/beachesStore';
import { getAllBeaches } from '../../../src/lib/beachesRepo';
import { isSqliteEnabled } from '../../../src/lib/dataSource';
import { verifyAdminCookie } from '../../../src/lib/admin/auth';
import { validateCSRF } from '../../../src/lib/csrf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = getClientIp(req);
  const rateCheck = await checkRateLimit(ip);

  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const beaches = isSqliteEnabled() ? await getAllBeaches() : await readBeaches();
        return res.status(200).json(beaches);

      case 'POST':
        const adminCookie = req.cookies.admin_auth;
        if (!verifyAdminCookie(adminCookie || '')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        // CSRF protection for POST operations
        if (!validateCSRF(req, res)) {
          return;
        }
        
        const createValidation = beachSchema.omit({ id: true, slug: true }).safeParse(req.body);
        
        if (!createValidation.success) {
          return res.status(422).json({
            error: 'Validation failed',
            details: createValidation.error.flatten().fieldErrors
          });
        }
        
        // Check for duplicates if requested
        const { checkDuplicates, duplicateDecision } = req.body;
        
        if (checkDuplicates && !duplicateDecision) {
          const duplicates = await findDuplicateCandidates(createValidation.data);
          if (duplicates.length > 0) {
            return res.status(409).json({
              error: 'Potential duplicates found',
              duplicates: duplicates.map(d => ({
                id: d.beach.id,
                name: d.beach.name,
                municipality: d.beach.municipality,
                distance: Math.round(d.distance),
                similarity: Math.round(d.nameSimilarity * 100),
                reason: d.reason
              }))
            });
          }
        }
        
        const newBeach = await addBeach(createValidation.data, {
          duplicateDecision: duplicateDecision as 'save_anyway' | 'merge' | undefined,
          adminUser: 'admin', // TODO: Extract from auth cookie if available
          ipAddress: ip
        });
        
        return res.status(201).json(newBeach);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Beaches API error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ 
      error: 'Internal server error',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }
}