import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create the response
  const response = NextResponse.next();

  // Set Content Security Policy headers to allow Google Forms embedding
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://www.google-analytics.com https://tagmanager.google.com https://docs.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://basemaps.cartocdn.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: http:",
    "media-src 'self' data: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://docs.google.com",
    "frame-ancestors 'none'",
    "frame-src 'self' https://docs.google.com https://www.google.com",
    "worker-src 'self' blob:",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://docs.google.com https://basemaps.cartocdn.com https://a.basemaps.cartocdn.com https://b.basemaps.cartocdn.com https://c.basemaps.cartocdn.com https://d.basemaps.cartocdn.com"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  
  // Set additional security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
