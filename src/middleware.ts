import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours (7,200,000 ms)

function isSessionValid(token?: string): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2 || !parts[0]) return false;

    let jsonStr = '';
    if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(parts[0], 'base64url').toString('utf8');
    } else {
      const b64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4;
      const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
      jsonStr = atob(padded);
    }

    const data = JSON.parse(jsonStr);
    if (!data.timestamp || typeof data.timestamp !== 'number') return false;
    if (Date.now() - data.timestamp > SESSION_MAX_AGE_MS) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('cgl_admin_session');
  const session = sessionCookie?.value;
  const valid = isSessionValid(session);

  // Root redirect
  if (pathname === '/') {
    if (valid) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      const response = NextResponse.redirect(new URL('/login', request.url));
      if (session && !valid) {
        response.cookies.delete('cgl_admin_session');
      }
      return response;
    }
  }

  // If trying to access protected dashboard routes without valid session
  if (pathname.startsWith('/dashboard')) {
    if (!valid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      if (session) {
        loginUrl.searchParams.set('expired', '1');
      }
      const response = NextResponse.redirect(loginUrl);
      if (session) {
        response.cookies.delete('cgl_admin_session');
      }
      return response;
    }
  }

  // If visiting login page
  if (pathname === '/login') {
    if (valid) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (session && !valid) {
      const response = NextResponse.next();
      response.cookies.delete('cgl_admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
  ],
};
