import type { NextApiRequest, NextApiResponse } from 'next';
import { beachSchema } from '../../../src/lib/forms';
import { checkRateLimit, getClientIp } from '../../../src/lib/rateLimit';
import { updateBeach, deleteBeach, findDuplicateCandidates } from '../../../src/lib/beachesStore';
import { verifyAdminCookie } from '../../../src/lib/admin/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(ip);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  // All operations require admin auth
  const adminCookie = req.cookies.admin_auth;
  if (!verifyAdminCookie(adminCookie || '')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Beach ID is required' });
  }

  try {
    switch (req.method) {
      case 'PUT':
        const updateValidation = beachSchema.omit({ id: true, slug: true }).partial().safeParse(req.body);
        
        if (!updateValidation.success) {
          return res.status(422).json({
            error: 'Validation failed',
            details: updateValidation.error.flatten().fieldErrors
          });
        }
        
        // Check for duplicates if location or name changed and requested
        const { checkDuplicates, duplicateDecision } = req.body;
        
        if (checkDuplicates && !duplicateDecision && 
            (updateValidation.data.coords || updateValidation.data.name || updateValidation.data.municipality)) {
          // For updates, we need to create a temp beach object to check duplicates
          // This is a simplified check - in a real app you might want to fetch the current beach first
          if (updateValidation.data.name && updateValidation.data.municipality && updateValidation.data.coords) {
            const tempBeach = {
              name: updateValidation.data.name!,
              municipality: updateValidation.data.municipality!,
              coords: updateValidation.data.coords!,
              tags: updateValidation.data.tags || [],
              amenities: updateValidation.data.amenities || [],
              coverImage: updateValidation.data.coverImage || ''
            };
            const duplicates = await findDuplicateCandidates(
              tempBeach,
              id // Exclude current beach from duplicate check
            );
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
        }
        
        const updatedBeach = await updateBeach(id, updateValidation.data, {
          duplicateDecision: duplicateDecision as 'save_anyway' | 'merge' | undefined,
          adminUser: 'admin', // TODO: Extract from auth cookie if available
          ipAddress: ip
        });
        
        if (!updatedBeach) {
          return res.status(404).json({ error: 'Beach not found' });
        }
        
        return res.status(200).json(updatedBeach);

      case 'DELETE':
        const deleted = await deleteBeach(id, {
          adminUser: 'admin', // TODO: Extract from auth cookie if available
          ipAddress: ip
        });
        
        if (!deleted) {
          return res.status(404).json({ error: 'Beach not found' });
        }
        
        return res.status(200).json({ 
          success: true,
          message: 'Beach deleted successfully'
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Beach API error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ 
      error: 'Internal server error',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }
}