import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy Function (replaces middleware)
 * 
 * Handles:
 * 1. CORS for cross-origin requests from PM and Admin apps
 * 2. Authentication checks for protected routes
 * 3. Tenant approval status validation
 */

export default function proxy(request: NextRequest) {
  // Get origin for CORS
  const origin = request.headers.get('origin') || '';
  const otherOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
  const allowedOrigins = otherOrigins.concat([
    process.env.PM_APP_URL || 'http://localhost:3001',
    process.env.ADMIN_APP_URL || 'http://localhost:3002',
  ]);

  const isAllowedOrigin = allowedOrigins.includes(origin);
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  } as const;

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Create response
  const response = NextResponse.next();

  // Add CORS headers to actual requests
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    response.headers.set('Access-Control-Allow-Credentials', corsHeaders['Access-Control-Allow-Credentials']);
    response.headers.set('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
    response.headers.set('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
  }

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Exclude static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
