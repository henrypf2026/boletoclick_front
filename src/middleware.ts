import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isBypassActive = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";
  if (isBypassActive) {
    return NextResponse.next();
  }

  // La auth vive por pestaña (sessionStorage + Authorization Bearer).
  // No usamos cookies compartidas aquí para evitar mezclar productor/comprador.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
