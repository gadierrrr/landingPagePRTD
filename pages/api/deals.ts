import type { NextApiRequest, NextApiResponse } from 'next';
import { dealSchema } from '../../src/lib/forms';
import { checkRateLimit, getClientIp } from '../../src/lib/rateLimit';
import { readDeals, addDeal as addDealJson, updateDeal as updateDealJson, deleteDeal as deleteDealJson } from '../../src/lib/dealsStore';
import { getAllDeals, createDeal, updateDeal as updateDealDb, deleteDeal as deleteDealDb } from '../../src/lib/dealsRepo';
import { isSqliteEnabled } from '../../src/lib/dataSource';
import { verifyAdminCookie } from '../../src/lib/admin/auth';
import { validateCSRF } from '../../src/lib/csrf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = getClientIp(req);
  const rateCheck = await checkRateLimit(ip);

  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const deals = isSqliteEnabled() ? await getAllDeals() : await readDeals();
        return res.status(200).json(deals);

      case 'POST':
        const adminCookie = req.cookies.admin_auth;
        if (!verifyAdminCookie(adminCookie || '')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        // CSRF validation for state-changing requests
        if (!validateCSRF(req, res)) {
          return;
        }

        const createValidation = dealSchema.omit({ id: true }).safeParse(req.body);

        if (!createValidation.success) {
          return res.status(422).json({
            error: 'Validation failed',
            details: createValidation.error.flatten().fieldErrors
          });
        }

        const newDeal = isSqliteEnabled()
          ? await createDeal(createValidation.data)
          : await addDealJson(createValidation.data);
        return res.status(201).json(newDeal);

      case 'PUT':
        const updateAdminCookie = req.cookies.admin_auth;
        if (!verifyAdminCookie(updateAdminCookie || '')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!validateCSRF(req, res)) {
          return;
        }

        const { id, ...updateData } = req.body;

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Deal ID is required' });
        }

        const updateValidation = dealSchema.omit({ id: true }).partial().safeParse(updateData);

        if (!updateValidation.success) {
          return res.status(422).json({
            error: 'Validation failed',
            details: updateValidation.error.flatten().fieldErrors
          });
        }

        const updatedDeal = isSqliteEnabled()
          ? await updateDealDb(id, updateValidation.data)
          : await updateDealJson(id, updateValidation.data);

        if (!updatedDeal) {
          return res.status(404).json({ error: 'Deal not found' });
        }

        return res.status(200).json(updatedDeal);

      case 'DELETE':
        const deleteAdminCookie = req.cookies.admin_auth;
        if (!verifyAdminCookie(deleteAdminCookie || '')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!validateCSRF(req, res)) {
          return;
        }

        const deleteId = req.body.id || req.query.id;

        if (!deleteId || typeof deleteId !== 'string') {
          return res.status(400).json({ error: 'Deal ID is required' });
        }

        const deleted = isSqliteEnabled()
          ? await deleteDealDb(deleteId)
          : await deleteDealJson(deleteId);

        if (!deleted) {
          return res.status(404).json({ error: 'Deal not found' });
        }

        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Deals API error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Internal server error' });
  }
}
