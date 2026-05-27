import { NextRequest, NextResponse } from 'next/server'

// TODO: implementar guards de autenticación y redirecciones por rol
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}
