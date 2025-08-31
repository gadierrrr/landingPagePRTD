import type { NextApiRequest, NextApiResponse } from 'next';
import { createAuthCookie } from '../../../src/lib/admin/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token || !process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Create signed cookie
  const cookieValue = createAuthCookie(token);
  
  // Set cookie (httpOnly, secure in production)
  res.setHeader('Set-Cookie', `admin_auth=${cookieValue}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  
  return res.status(200).json({ success: true });
}