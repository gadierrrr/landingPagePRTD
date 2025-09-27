import type { NextApiRequest, NextApiResponse } from 'next';
import { createAuthCookie } from '../../../src/lib/admin/auth';
import { generateCSRFToken, getSessionId } from '../../../src/lib/csrf';

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
  
  // Generate CSRF token for authenticated session
  // Create a mock request object for session ID generation
  const mockReq = { cookies: { admin_auth: cookieValue } } as unknown as NextApiRequest;
  const sessionId = getSessionId(mockReq);
  const csrfToken = generateCSRFToken(sessionId);
  
  // Set both cookies using an array
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? '; Secure' : '';
  
  res.setHeader('Set-Cookie', [
    `admin_auth=${cookieValue}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${secureFlag}`,
    `csrf_token=${csrfToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${secureFlag}`
  ]);
  
  return res.status(200).json({ success: true, csrfToken });
}