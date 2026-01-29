import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection and role-based access control
 *
 * Protects admin routes and ensures only authorized users can access them.
 * Uses Better Auth session cookie for authentication.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // Better Auth uses 'better-auth.session_token' cookie by default
    const sessionToken = request.cookies.get('better-auth.session_token')?.value;

    // Not logged in - redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Note: Role verification happens on the server side via BetterAuthGuard.
    // The session token is validated by the backend on each API request.
    // For additional client-side role checks, we could decode the session
    // or make an API call, but this adds latency.
    //
    // For now, we allow access and let the backend enforce role-based access.
    // If the user doesn't have permission, the API will return 403.
    return NextResponse.next();
  }

  return NextResponse.next();
}

/**
 * Configure which routes should be protected
 */
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
