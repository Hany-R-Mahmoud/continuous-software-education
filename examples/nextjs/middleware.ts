/**
 * Next.js File-based Middleware
 * 
 * This example shows how to use Next.js middleware.ts file
 * for route protection and authentication checks.
 * 
 * Place this file in the root of your project (or src/ directory)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Get token from cookie or header
  const token = request.cookies.get('accessToken')?.value 
    || request.headers.get('authorization')?.replace('Bearer ', '');
  
  // 2. Define route patterns
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') 
    || request.nextUrl.pathname.startsWith('/register');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/protected');
  
  // 3. Handle protected routes
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 4. Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 5. Handle protected API routes
  if (isApiRoute && !token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // 6. Add custom headers (optional)
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  
  return response;
}

/**
 * Configure which routes this middleware runs on
 * Use matcher to optimize performance
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/api/protected/:path*',
  ],
};

/**
 * Note: Middleware runs on Edge Runtime
 * - Fast execution
 * - Limited Node.js APIs
 * - No access to database directly
 * - Use for simple checks and redirects
 */

