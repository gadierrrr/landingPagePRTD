import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? '; Secure' : '';

  // Expire auth and CSRF cookies
  res.setHeader('Set-Cookie', [
    `admin_auth=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${secureFlag}`,
    `csrf_token=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${secureFlag}`,
  ]);

  return res.status(200).json({ success: true });
}

