import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren cualquier usuario autenticado
const AUTH_ROUTES = ["/mis-tickets", "/mis-compras", "/checkout", "/perfil"];

// Rutas restringidas por rol
const ADMIN_ROUTES = ["/admin", "/dashboard-admin"];
const PRODUCER_ROUTES = ["/producer"];

function isProducerOnlyRoute(pathname: string): boolean {
  if (matchesRoute(pathname, PRODUCER_ROUTES)) return true;
  if (pathname === "/eventos/crear") return true;
  if (/^\/eventos\/[^/]+\/editar/.test(pathname)) return true;
  return false;
}

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔓 MODO DESARROLLO / BYPASS PARA PRUEBAS
  // Si la variable de entorno está activa, dejamos pasar cualquier ruta sin validar cookies ni roles.
  const isBypassActive = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";
  if (isBypassActive) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  const role = request.cookies.get("user_role")?.value;

  const isAuthenticated = Boolean(token);

  if (matchesRoute(pathname, AUTH_ROUTES) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    matchesRoute(pathname, ADMIN_ROUTES) &&
    (!isAuthenticated || role !== "admin")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    isProducerOnlyRoute(pathname) &&
    (!isAuthenticated || role !== "producer")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
