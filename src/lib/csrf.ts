import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LIFETIME = 3600 * 1000; // 1 hour

interface CSRFTokenData {
  token: string;
  createdAt: number;
}

// In-memory token store (could be moved to Redis for multi-instance setups)
const tokenStore = new Map<string, CSRFTokenData>();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of tokenStore.entries()) {
    if (now - data.createdAt > CSRF_TOKEN_LIFETIME) {
      tokenStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  
  tokenStore.set(sessionId, {
    token,
    createdAt: Date.now()
  });
  
  return token;
}

export function verifyCSRFToken(sessionId: string, providedToken: string): boolean {
  const storedData = tokenStore.get(sessionId);
  
  if (!storedData) {
    return false;
  }
  
  // Check if token has expired
  if (Date.now() - storedData.createdAt > CSRF_TOKEN_LIFETIME) {
    tokenStore.delete(sessionId);
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(storedData.token, 'hex'),
    Buffer.from(providedToken, 'hex')
  );
}

export function getSessionId(req: NextApiRequest): string {
  // Use admin auth cookie as session identifier
  const adminCookie = req.cookies.admin_auth;
  if (!adminCookie) {
    return 'anonymous';
  }
  
  // Create a stable session ID from the cookie
  return crypto.createHash('sha256').update(adminCookie).digest('hex').substring(0, 16);
}

export function setCSRFCookie(res: NextApiResponse, token: string): void {
  res.setHeader('Set-Cookie', `${CSRF_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}

export function validateCSRF(req: NextApiRequest, res: NextApiResponse): boolean {
  // Only validate CSRF for state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method || '')) {
    return true;
  }
  
  const sessionId = getSessionId(req);
  const providedToken = req.headers[CSRF_HEADER_NAME] as string;
  
  if (!providedToken) {
    res.status(403).json({ error: 'CSRF token missing' });
    return false;
  }
  
  if (!verifyCSRFToken(sessionId, providedToken)) {
    res.status(403).json({ error: 'CSRF token invalid' });
    return false;
  }
  
  return true;
}

// Middleware function for easy integration
export function withCSRFProtection(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!validateCSRF(req, res)) {
      return;
    }
    
    return handler(req, res);
  };
}

// API endpoint to get CSRF token
export function handleCSRFTokenRequest(req: NextApiRequest, res: NextApiResponse): void {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const sessionId = getSessionId(req);
  const token = generateCSRFToken(sessionId);
  
  setCSRFCookie(res, token);
  
  res.status(200).json({ csrfToken: token });
}