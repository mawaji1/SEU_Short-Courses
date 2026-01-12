import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection and role-based access control
 * 
 * Protects admin routes and ensures only authorized users can access them
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    const authData = request.cookies.get('seu_auth')?.value;

    // Not logged in - redirect to login
    if (!authData) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode JWT to check role
      const auth = JSON.parse(authData);
      const user = parseJwt(auth.accessToken);

      // Check if user has admin/operations/finance role
      const allowedRoles = ['ADMIN', 'OPERATIONS', 'FINANCE', 'COORDINATOR'];
      
      if (!allowedRoles.includes(user.role)) {
        // Unauthorized - redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Authorized - allow access
      return NextResponse.next();
    } catch (error) {
      // Invalid token - redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/**
 * Parse JWT token (without verification - verification happens on backend)
 */
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Configure which routes should be protected
 */
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
