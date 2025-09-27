import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { verifyAdminCookie } from '../../../src/lib/admin/auth';
import { isImageReferenced } from '../../../src/lib/eventsStore';
import { checkRateLimit, getClientIp } from '../../../src/lib/rateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = getClientIp(req);
  const rateCheck = await checkRateLimit(ip);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  // Check admin authentication
  const adminCookie = req.cookies.admin;
  if (!verifyAdminCookie(adminCookie || '')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Validate image URL format
    if (!imageUrl.startsWith('/images/uploads/events/')) {
      return res.status(400).json({ error: 'Invalid image URL format' });
    }

    // Check if image is referenced by any event
    const isReferenced = await isImageReferenced(imageUrl);
    if (isReferenced) {
      return res.status(409).json({ error: 'Cannot delete image: still referenced by events' });
    }

    // Convert URL to file path
    const relativePath = imageUrl.replace('/images/', '');
    const filePath = path.join(process.cwd(), 'public', 'images', relativePath);
    
    // Check if file exists
    try {
      await fs.promises.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'Image file not found' });
    }

    // Delete the file
    await fs.promises.unlink(filePath);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
}