import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren cualquier usuario autenticado
const AUTH_ROUTES = ['/mis-tickets', '/mis-compras', '/checkout', '/perfil'];

// Rutas restringidas por rol
const ADMIN_ROUTES = ['/admin'];
const PRODUCER_ROUTES = ['/producer'];

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value;

  const isAuthenticated = Boolean(token);

  if (matchesRoute(pathname, AUTH_ROUTES) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesRoute(pathname, ADMIN_ROUTES) && (!isAuthenticated || role !== 'admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (matchesRoute(pathname, PRODUCER_ROUTES) && (!isAuthenticated || role !== 'producer')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
