import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDashboardPath, isPathAllowed } from './lib/roleAccess';

async function fetchMe(req: NextRequest): Promise<{ id: string; username: string; role: string } | null> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  try {
    const res = await fetch(`${base}/api/auth/me`, {
      // Forward cookies for session-based auth
      headers: {
        cookie: req.headers.get('cookie') ?? '',
        'content-type': 'application/json',
      },
      // Credentials flag is not used in middleware, cookie header forwarding is key
      method: 'GET',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.role ? data : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public/static paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    return NextResponse.next();
  }

  // Always allow login page to render
  if (pathname === '/login') {
    const me = await fetchMe(req);
    if (me) {
      const target = getDashboardPath(me.role);
      return NextResponse.redirect(new URL(target, req.url));
    }
    return NextResponse.next();
  }

  // Check current session user
  const me = await fetchMe(req);
  if (!me) {
    // Not authenticated → redirect to /login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = me.role;

  // Default landing → redirect to role dashboard
  if (pathname === '/' || pathname === '/dashboard') {
    const target = getDashboardPath(role);
    return NextResponse.redirect(new URL(target, req.url));
  }

  // Enforce role-based access. Admin has full access.
  if (!isPathAllowed(role, pathname)) {
    const target = getDashboardPath(role);
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|static|.*\\.(?:png|jpg|svg|ico|css|js)).*)'],
};
