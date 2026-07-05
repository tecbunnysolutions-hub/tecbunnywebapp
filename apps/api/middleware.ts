import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'https://tecbunny.com',
  'https://www.tecbunny.com',
  'https://mgmt.tecbunny.com',
  'https://superadmin.tecbunny.com',
  'http://localhost:3000', // public
  'http://localhost:3001', // mgmt
  'http://localhost:3002', // superadmin
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const authHeader = request.headers.get('authorization');
  const isM2MAuth = authHeader === `Bearer ${process.env.INTERNAL_SERVICE_KEY}`;

  // Allow M2M Auth directly (e.g., from WABA worker)
  if (isM2MAuth) {
    return NextResponse.next();
  }
  
  // Create a base response
  const response = NextResponse.next();
  
  // If the origin is in our allowed list, append the CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow non-browser requests (like server-to-server) without origin
    // Since M2M is checked above, any other server-to-server might be rejected or allowed depending on strictness
    // We'll allow it through, but it won't have the M2M auth. Endpoints should validate Auth!
  } else {
    // Return forbidden for unauthorized origins
    return new NextResponse(null, {
      status: 403,
      statusText: 'Forbidden',
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Common CORS headers
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
