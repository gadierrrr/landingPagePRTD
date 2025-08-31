import crypto from 'crypto';

const SECRET = process.env.ADMIN_TOKEN || 'fallback-secret';

export function createAuthCookie(token: string): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${token}:${timestamp}`)
    .digest('hex');
  
  return `${token}:${timestamp}:${signature}`;
}

export function verifyAdminCookie(cookieValue: string): boolean {
  if (!cookieValue || !process.env.ADMIN_TOKEN) {
    return false;
  }

  const parts = cookieValue.split(':');
  if (parts.length !== 3) {
    return false;
  }

  const [token, timestamp, signature] = parts;
  
  // Verify token matches
  if (token !== process.env.ADMIN_TOKEN) {
    return false;
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', SECRET)
    .update(`${token}:${timestamp}`)
    .digest('hex');

  return signature === expectedSignature;
}