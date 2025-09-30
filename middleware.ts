import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create the response
  const response = NextResponse.next();

  // Note: Security headers (CSP, X-Frame-Options, etc.) are set in nginx config
  // to avoid duplicate headers. See /etc/nginx/sites-available/prtd.conf

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
